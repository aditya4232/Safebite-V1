// API base URL
export const API_BASE_URL = 'https://safebite-backend.onrender.com';

// For local development, uncomment the line below
// export const API_BASE_URL = 'http://localhost:5000';

/**
 * Check if the API is available
 * @returns Promise<boolean> - True if API is available, false otherwise
 */
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Try to fetch the status endpoint
    // First try /status, then fall back to / if that fails
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/status`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
    } catch (error) {
      console.log('Error fetching /status, trying root endpoint');
      response = await fetch(`${API_BASE_URL}/`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
    }

    // Clear the timeout
    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      console.warn(`API status check failed with status: ${response.status}`);
      return false;
    }

    // Try to parse the response
    const data = await response.json();

    // Check if the response contains the expected status
    if (data && data.status === 'API is running') {
      console.log('API is available:', data);
      return true;
    }

    console.warn('API status check returned unexpected data:', data);
    return false;
  } catch (error) {
    console.error('Error checking API status:', error);
    return false;
  }
};

/**
 * Fetch products from the API with fallback
 * @param collection - Collection name ('products' or 'groceryProducts')
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param search - Optional search query
 * @param fallbackData - Data to use if API is unavailable
 * @returns Promise with product data and pagination info
 */
export const fetchProductsWithFallback = async (
  collection: 'products' | 'groceryProducts' = 'products',
  page: number = 1,
  limit: number = 20,
  search: string = '',
  fallbackData: any = { products: [], total: 0, page: 1, totalPages: 1 }
): Promise<{ products: any[], total: number, page: number, totalPages: number }> => {
  try {
    // Check if API is available first
    const isApiAvailable = await checkApiStatus();

    if (!isApiAvailable) {
      console.warn('API is not available, using fallback data');
      return fallbackData;
    }

    // API is available, try to fetch products
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    // Helper function to process response
    const processResponse = async (response: Response) => {
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      // Check if the response has the expected structure
      if (data && data.products && Array.isArray(data.products)) {
        console.log(`Successfully fetched ${data.products.length} ${collection} from API`);
        return {
          products: data.products,
          total: data.total || data.products.length,
          page: data.page || page,
          totalPages: data.totalPages || Math.ceil((data.total || data.products.length) / limit)
        };
      }

      // If the response is just an array, convert it to the expected format
      if (data && Array.isArray(data)) {
        console.log(`Successfully fetched ${data.length} ${collection} from API (array format)`);
        return {
          products: data,
          total: data.length,
          page: page,
          totalPages: Math.ceil(data.length / limit)
        };
      }

      // If we got here, the response format is unexpected
      console.warn(`Unexpected API response format for ${collection}:`, data);
      throw new Error('Unexpected API response format');
    };

    try {
      // First try the new API endpoint format
      const url = `${API_BASE_URL}/api/${collection}?page=${page}&limit=${limit}${
        search ? `&search=${encodeURIComponent(search)}` : ''
      }`;
      
      console.log(`Fetching from new endpoint: ${url}`);
      
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const result = await processResponse(response);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      console.warn(`Error fetching from new endpoint: ${error}`);
      
      // Fall back to legacy endpoint if new one fails
      try {
        const legacyUrl = collection === 'products' 
          ? `${API_BASE_URL}/products` 
          : `${API_BASE_URL}/grocery-products`;
        
        console.log(`Falling back to legacy endpoint: ${legacyUrl}`);
        
        const legacyResponse = await fetch(legacyUrl, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        const result = await processResponse(legacyResponse);
        clearTimeout(timeoutId);
        return result;
      } catch (legacyError) {
        console.error(`Error fetching from legacy endpoint: ${legacyError}`);
        clearTimeout(timeoutId);
        return fallbackData;
      }
    }
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error);
    return fallbackData;
  }
};

/**
 * Fetch recipes from the API with fallback
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param search - Optional search query
 * @param fallbackData - Data to use if API is unavailable
 * @returns Promise with recipe data and pagination info
 */
export const fetchRecipesWithFallback = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  fallbackData: any = { recipes: [], total: 0, page: 1, totalPages: 1 }
): Promise<{ recipes: any[], total: number, page: number, totalPages: number }> => {
  try {
    // Use the products fetch function but rename the result
    const result = await fetchProductsWithFallback('products', page, limit, search, {
      products: fallbackData.recipes,
      total: fallbackData.total,
      page: fallbackData.page,
      totalPages: fallbackData.totalPages
    });
    
    // Convert the result to the expected format
    return {
      recipes: result.products,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return fallbackData;
  }
};

// Remove the JSX component from this file as it's a pure TypeScript utility file
// We'll create a separate React component for the API status indicator

export default {
  API_BASE_URL,
  checkApiStatus,
  fetchProductsWithFallback,
  fetchRecipesWithFallback
};
