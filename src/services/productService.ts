// Product service for fetching products from the API

// API base URL - change this to your deployed backend URL when ready
export const API_BASE_URL = 'https://safebite-backend.onrender.com';

// For local development, uncomment the line below
// export const API_BASE_URL = 'http://localhost:5000';

// Product interface
export interface Product {
  _id: string;
  name?: string;
  ProductName?: string; // For grocery products
  brand?: string;
  Brand?: string; // For grocery products
  category?: string;
  Category?: string; // For grocery products
  description?: string;
  ingredients?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
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
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data && data.status === 'API is running';
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
    const url = `${API_BASE_URL}/api/products?page=${page}&limit=${limit}${
      search ? `&search=${encodeURIComponent(search)}` : ''
    }`;
    
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
    
    // Return the paginated response
    return {
      products: data.products || [],
      total: data.total || 0,
      page: data.page || page,
      totalPages: data.totalPages || 1
    };
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
 * @returns Promise with paginated grocery products
 */
export const fetchGroceryProducts = async (
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
    const url = `${API_BASE_URL}/api/groceryProducts?page=${page}&limit=${limit}${
      search ? `&search=${encodeURIComponent(search)}` : ''
    }`;
    
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
    
    // Return the paginated response
    return {
      products: data.products || [],
      total: data.total || 0,
      page: data.page || page,
      totalPages: data.totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching grocery products:', error);
    return { products: [], total: 0, page: 1, totalPages: 1 };
  }
};

/**
 * Fetch a product by ID
 * @param id - Product ID
 * @returns Promise with the product
 */
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiStatus();
    
    if (!isApiAvailable) {
      console.warn('API is not available, returning null');
      return null;
    }
    
    // Fetch data from the API
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

/**
 * Fetch a grocery product by ID
 * @param id - Grocery product ID
 * @returns Promise with the grocery product
 */
export const fetchGroceryProductById = async (id: string): Promise<Product | null> => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiStatus();
    
    if (!isApiAvailable) {
      console.warn('API is not available, returning null');
      return null;
    }
    
    // Fetch data from the API
    const response = await fetch(`${API_BASE_URL}/api/groceryProducts/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching grocery product by ID:', error);
    return null;
  }
};

export default {
  API_BASE_URL,
  checkApiStatus,
  fetchProducts,
  fetchGroceryProducts,
  fetchProductById,
  fetchGroceryProductById
};
