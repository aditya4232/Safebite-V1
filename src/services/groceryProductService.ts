/**
 * Grocery Product Service
 * 
 * This service handles all interactions with the grocery products API
 */

// Base URL for the backend API
const API_BASE_URL = 'https://safebite-backend.onrender.com';

/**
 * Search for grocery products by name
 * @param query The search query
 * @returns Promise with the search results
 */
export const searchGroceryProducts = async (query: string) => {
  try {
    if (!query || query.trim() === '') {
      return { error: 'Search query is required' };
    }

    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { products: [], message: 'No products found matching your search' };
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { products: data, success: true };
  } catch (error) {
    console.error('Error searching grocery products:', error);
    return { 
      error: 'Failed to search products. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Get a grocery product by ID
 * @param id The product ID
 * @returns Promise with the product details
 */
export const getGroceryProductById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/grocery/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Product not found' };
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { product: data, success: true };
  } catch (error) {
    console.error('Error fetching grocery product:', error);
    return { 
      error: 'Failed to fetch product details. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Get all grocery products with pagination and filtering
 * @param page Page number (default: 1)
 * @param limit Number of items per page (default: 20)
 * @param search Optional search term
 * @param category Optional category filter
 * @param store Optional store filter
 * @returns Promise with paginated products
 */
export const getGroceryProducts = async (
  page: number = 1, 
  limit: number = 20,
  search?: string,
  category?: string,
  store?: string
) => {
  try {
    let url = `${API_BASE_URL}/grocery?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    if (store) {
      url += `&store=${encodeURIComponent(store)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { ...data, success: true };
  } catch (error) {
    console.error('Error fetching grocery products:', error);
    return { 
      error: 'Failed to fetch products. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

// Export default object with all methods
export default {
  searchGroceryProducts,
  getGroceryProductById,
  getGroceryProducts
};
