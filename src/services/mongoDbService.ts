/**
 * MongoDB Service
 *
 * This service handles all interactions with the MongoDB Atlas database through the Flask backend API
 */

// Base URL for the Flask backend API
const API_BASE_URL = 'https://safebite-backend.onrender.com/api';

// For local development, uncomment this line
// const API_BASE_URL = 'http://localhost:10000/api';

/**
 * Search for products in MongoDB by name
 * @param query The search query
 * @returns Promise with the search results
 */
export const searchProducts = async (query: string) => {
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
    console.error('Error searching MongoDB products:', error);
    return {
      error: 'Failed to search products. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Get a product by ID from MongoDB
 * @param id The product ID
 * @returns Promise with the product details
 */
export const getProductById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Product not found' };
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { product: data, success: true };
  } catch (error) {
    console.error('Error fetching MongoDB product:', error);
    return {
      error: 'Failed to fetch product details. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Check the status of the MongoDB API
 * @returns Promise with the API status
 */
export const checkApiStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { status: data, success: true };
  } catch (error) {
    console.error('Error checking MongoDB API status:', error);
    return {
      error: 'Failed to check API status. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

// Export default object with all methods
export default {
  searchProducts,
  getProductById,
  checkApiStatus
};
