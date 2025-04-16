// Product service for fetching products from the API

// API base URL - Always use the Render backend for reliable results
export const API_BASE_URL = 'http://10.20.65.157:10000';

// Product interface
export interface Product {
  _id: string;
  // Collection information
  _collection?: 'grocery' | 'products'; // Which collection the product belongs to

  // Standard fields
  name?: string;
  brand?: string;
  category?: string;
  description?: string;

  // MongoDB specific fields
  product?: string; // MongoDB product name field
  index?: number;
  sub_category?: string;
  sale_price?: number;
  market_price?: number;
  type?: string;
  rating?: number;

  // Legacy fields
  ProductName?: string; // For grocery products
  Brand?: string; // For grocery products
  Category?: string; // For grocery products

  // Nutrition information
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };

  // Additional fields
  ingredients?: string[];
  allergens?: string[];
  dietaryInfo?: string[];
  healthScore?: number;
  imageUrl?: string;
  price?: number;
  tags?: string[];
}

// Pagination response interface
export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Check if the API is available
 * @returns Promise<boolean> - True if API is available, false otherwise
 */
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`API status check failed with status ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('API status check response:', data);
    return data && (data.status === 'API is running' || data.status === 'running' || data.api_status === 'running');
  } catch (error) {
    console.error('Error checking API status:', error);
    return false;
  }
};

/**
 * Fetch products with pagination and search
 * @param page - Page number
 * @param limit - Number of items per page
 * @param search - Search query
 * @returns Promise with paginated products
 */
export const fetchProducts = async (
  page: number = 1,
  limit: number = 20,
  search: string = ''
): Promise<PaginatedResponse<Product>> => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiStatus();

    if (!isApiAvailable) {
      console.warn('API is not available, returning empty data');
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }

    // Build the URL with query parameters
    const url = `${API_BASE_URL}/dataset/products?page=${page}&limit=${limit}${
      search ? `&search=${encodeURIComponent(search)}` : ''
    }`;

    console.log('Fetching products from:', url);

    // Fetch data from the API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('Products API response:', data);

    // Handle the response format from the MongoDB backend
    if (data.products && Array.isArray(data.products)) {
      // MongoDB backend format
      return {
        products: data.products,
        total: data.total || 0,
        page: data.page || page,
        totalPages: data.totalPages || 1
      };
    } else if (Array.isArray(data)) {
      // If the API returns an array directly
      return {
        products: data,
        total: data.length,
        page: page,
        totalPages: Math.ceil(data.length / limit)
      };
    } else if (data.results && Array.isArray(data.results)) {
      // Format with results array
      return {
        products: data.results,
        total: data.count || data.results.length,
        page: page,
        totalPages: Math.ceil((data.count || data.results.length) / limit)
      };
    } else {
      console.warn('Unexpected API response format:', data);
      return { products: [], total: 0, page: page, totalPages: 1 };
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, page: 1, totalPages: 1 };
  }
};

/**
 * Fetch grocery products with pagination and search
 * @param page - Page number
 * @param limit - Number of items per page
 * @param search - Search query
 * @param category - Optional category filter
 * @returns Promise with paginated grocery products
 */
export const fetchGroceryProducts = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  category: string = ''
): Promise<PaginatedResponse<Product>> => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiStatus();

    if (!isApiAvailable) {
      console.warn('API is not available, returning empty data');
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }

    // Prioritized list of endpoints to try in order
    const endpointsToTry = [
      `/grocery`,
      `/grocery-products`,
      `/api/grocery`,
      `/api/grocery-products`,
      `/dataset/grocery`,
      `/dataset/groceryProducts`
    ];

    let response = null;
    let url = '';
    let endpointFound = false;

    // Try each endpoint until one works
    for (const endpoint of endpointsToTry) {
      // Build URL with all query parameters
      url = `${API_BASE_URL}${endpoint}?page=${page}&limit=${limit}`;

      // Add search parameter if provided
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      // Add category parameter if provided
      if (category && category.toLowerCase() !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }

      console.log('Trying grocery endpoint:', url);

      try {
        // Fetch data from the API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          endpointFound = true;
          console.log('Found working grocery endpoint:', url);
          break;
        }
      } catch (endpointError) {
        console.warn(`Grocery endpoint ${endpoint} failed:`, endpointError);
      }
    }

    // If all grocery-specific endpoints failed, try the search endpoint as fallback
    if (!endpointFound || !response) {
      console.warn('All grocery endpoints failed, trying search endpoint as fallback');

      try {
        const searchUrl = `${API_BASE_URL}/search?q=${encodeURIComponent(search || 'food')}&collection=grocery&limit=${limit}`;
        console.log('Trying search fallback:', searchUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('Search fallback successful');
          endpointFound = true;
        }
      } catch (searchError) {
        console.error('Search fallback also failed:', searchError);
      }
    }

    if (!endpointFound || !response) {
      console.error('All endpoints failed');
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }

    const data = await response.json();
    console.log('Grocery products API response:', data);

    // Handle the response format from the MongoDB backend
    if (data.products && Array.isArray(data.products)) {
      // MongoDB backend format (most common)
      return {
        products: data.products.map((product: any) => {
          // Ensure consistent field names
          if (!product.name && product.product) {
            product.name = product.product;
          }
          if (!product._collection) {
            product._collection = 'grocery';
          }
          return product;
        }),
        total: data.total || 0,
        page: data.page || page,
        totalPages: data.totalPages || 1
      };
    } else if (data.results && Array.isArray(data.results)) {
      // Search endpoint format
      const groceryResults = data.results.filter((item: any) =>
        item._collection === 'grocery' || item.product || item.category === 'Grocery'
      );

      return {
        products: groceryResults.map((product: any) => {
          if (!product.name && product.product) {
            product.name = product.product;
          }
          if (!product._collection) {
            product._collection = 'grocery';
          }
          return product;
        }),
        total: groceryResults.length,
        page: page,
        totalPages: Math.ceil(groceryResults.length / limit)
      };
    } else if (Array.isArray(data)) {
      // If the API returns an array directly
      return {
        products: data.map((product: any) => {
          if (!product.name && product.product) {
            product.name = product.product;
          }
          if (!product._collection) {
            product._collection = 'grocery';
          }
          return product;
        }),
        total: data.length,
        page: page,
        totalPages: Math.ceil(data.length / limit)
      };
    } else {
      console.warn('Unexpected API response format:', data);
      return { products: [], total: 0, page: page, totalPages: 1 };
    }
  } catch (error) {
    console.error('Error fetching grocery products:', error);
    return { products: [], total: 0, page: 1, totalPages: 1 };
  }
};

/**
 * Fetch a product by ID from any collection
 * @param id - Product ID
 * @param collectionType - Optional collection type ('products' or 'grocery')
 * @returns Promise with the product
 */
export const fetchProductById = async (id: string, collectionType?: 'products' | 'grocery'): Promise<Product | null> => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiStatus();

    if (!isApiAvailable) {
      console.warn('API is not available, returning null');
      return null;
    }

    // Build URL with optional collection type parameter
    const url = `${API_BASE_URL}/dataset/products/${id}`;
    console.log('Fetching product details from:', url);

    // Fetch data from the API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('Product details API response:', data);

    // Add collection type if not already set
    if (data && !data._collection && collectionType) {
      data._collection = collectionType;
    }

    return data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

/**
 * Fetch a grocery product by ID (convenience method)
 * @param id - Grocery product ID
 * @returns Promise with the grocery product
 */
export const fetchGroceryProductById = async (id: string): Promise<Product | null> => {
  return fetchProductById(id, 'grocery');
};

/**
 * Search for products across both collections
 * @param query - Search query
 * @param limit - Number of results to return
 * @returns Promise with search results
 */
export const searchProducts = async (query: string, limit: number = 20): Promise<Product[]> => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiStatus();

    if (!isApiAvailable) {
      console.warn('API is not available, returning empty results');
      return [];
    }

    // Build the search URL
    const url = `${API_BASE_URL}/api/dataset/search?query=${encodeURIComponent(query)}&limit=${limit}`;
    console.log('Searching products from:', url);

    // Fetch data from the API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('Search API response:', data);

    // Handle different response formats
    if (data.items && Array.isArray(data.items)) {
      return data.items;
    } else if (data.results && Array.isArray(data.results)) {
      return data.results;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export default {
  API_BASE_URL,
  checkApiStatus,
  fetchProducts,
  fetchGroceryProducts,
  fetchProductById,
  fetchGroceryProductById,
  searchProducts
};
