/**
 * Unified Grocery Service
 *
 * This service handles both MongoDB and scraping searches for grocery products
 * with fallback mechanisms and error handling
 */

import { GroceryProduct } from '@/types/groceryTypes';
import { trackUserInteraction } from './mlService';
import { API_BASE_URL, fetchWithTimeout, generateFallbackData, checkApiStatus } from './apiService';

/**
 * Search for grocery products using MongoDB
 * @param query The search query
 * @returns Promise with the search results
 */
export const searchMongoDBProducts = async (query: string): Promise<GroceryProduct[]> => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    // Check if API is available
    const isApiAvailable = await checkApiStatus();
    if (!isApiAvailable) {
      console.warn('Grocery API is not available, using fallback data');
      throw new Error('API not available');
    }

    // Use the improved fetchWithTimeout function
    const data = await fetchWithTimeout(`/api/grocery/mongodb-search?q=${encodeURIComponent(query)}`);

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      // Transform the API response to match our GroceryProduct interface
      return data.results.map((item: any) => ({
        _id: item._id || `${item.name || item.product}-${Date.now()}`,
        name: item.name || item.product || 'Unknown Product',
        brand: item.brand || '',
        category: item.category || '',
        description: item.description || '',
        price: item.price || 0,
        sale_price: item.sale_price || item.price,
        market_price: item.market_price || item.price,
        image_url: item.image_url || `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},grocery`,
        source: 'MongoDB',
        platform: '',
        redirect: item.redirect || '',
        nutritional_info: item.nutritional_info || {},
        offers: item.offers || [],
        rating: item.rating || 0,
        reviews_count: item.reviews_count || 0,
        in_stock: item.in_stock !== undefined ? item.in_stock : true,
        delivery_time: item.delivery_time || '',
        _collection: 'grocery'
      }));
    }

    return [];
  } catch (error) {
    console.error('Error searching MongoDB products:', error);
    return [];
  }
};

/**
 * Search for grocery products using web scraping
 * @param query The search query
 * @returns Promise with the search results
 */
export const searchScrapedProducts = async (query: string): Promise<GroceryProduct[]> => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    console.log('Searching for grocery products using web scraping:', query);

    // Try multiple endpoints in order of preference
    const endpoints = [
      `https://safebite-backend.onrender.com/api/grocery/scrape?q=${encodeURIComponent(query)}`,
      `http://localhost:5001/api/grocery/scrape?q=${encodeURIComponent(query)}`,
      `/api/grocery/scrape?q=${encodeURIComponent(query)}`,
      `/api/grocery/search?q=${encodeURIComponent(query)}`
    ];

    let data = null;
    let error = null;

    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        // Use the improved fetchWithTimeout function with a longer timeout for scraping
        data = await fetchWithTimeout(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }, 20000); // 20 second timeout for scraping

        if (data && Array.isArray(data.results) && data.results.length > 0) {
          console.log(`Found ${data.results.length} products from ${endpoint}`);
          break;
        }
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err);
        error = err;
      }
    }

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      // Transform the API response to match our GroceryProduct interface
      return data.results.map((item: any) => ({
        _id: item._id || `${item.name || item.product}-${Date.now()}`,
        name: item.name || item.product || 'Unknown Product',
        brand: item.brand || '',
        category: item.category || '',
        description: item.description || '',
        price: item.price || 0,
        sale_price: item.sale_price || item.price,
        market_price: item.market_price || item.price,
        image_url: item.image_url || `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},grocery`,
        source: item.source || 'Scraping',
        platform: item.platform || item.source || '',
        redirect: item.redirect || '',
        nutritional_info: item.nutritional_info || {},
        offers: item.offers || [],
        rating: item.rating || 4.0,
        reviews_count: item.reviews_count || 0,
        in_stock: item.in_stock !== undefined ? item.in_stock : true,
        delivery_time: item.delivery_time || '',
        _collection: 'grocery',
        weight: item.weight || ''
      }));
    }

    // If no results, use fallback data
    console.warn('No results from scraping API, using fallback data');
    return generateMockProducts(query, 'Scraping');
  } catch (error) {
    console.error('Error searching scraped products:', error);
    return generateMockProducts(query, 'Scraping');
  }
};

/**
 * Generate mock grocery products when API fails
 * @param query The search query
 * @param source The source of the products (MongoDB or Scraping)
 * @returns Array of mock grocery products
 */
export const generateMockProducts = (query: string, source: 'MongoDB' | 'Scraping' = 'MongoDB'): GroceryProduct[] => {
  // Track this as a fallback
  trackUserInteraction('using_mock_grocery_data', {
    query,
    source,
    reason: 'API failure'
  });

  // Use the improved generateFallbackData function
  const fallbackData = generateFallbackData('grocery', query);

  // Add source information based on the source parameter
  return fallbackData.map((item: any) => ({
    ...item,
    source: source === 'Scraping' ? item.platform || 'Scraping' : 'MongoDB',
    platform: source === 'Scraping' ? item.platform : '',
  })) as GroceryProduct[];
};

/**
 * Unified search function that tries both MongoDB and scraping
 * @param query The search query
 * @param preferScraping Whether to prefer scraping over MongoDB
 * @returns Promise with the search results
 */
export const unifiedGrocerySearch = async (
  query: string,
  preferScraping: boolean = false
): Promise<GroceryProduct[]> => {
  try {
    // Try the preferred method first
    const primaryResults = preferScraping
      ? await searchScrapedProducts(query)
      : await searchMongoDBProducts(query);

    // If we got results, return them
    if (primaryResults.length > 0) {
      return primaryResults;
    }

    // Otherwise, try the other method
    const secondaryResults = preferScraping
      ? await searchMongoDBProducts(query)
      : await searchScrapedProducts(query);

    // If we got results from the secondary method, return them
    if (secondaryResults.length > 0) {
      return secondaryResults;
    }

    // If both methods failed, return mock data
    return generateMockProducts(query, preferScraping ? 'Scraping' : 'MongoDB');
  } catch (error) {
    console.error('Error in unified grocery search:', error);
    // Return mock data as a last resort
    return generateMockProducts(query, preferScraping ? 'Scraping' : 'MongoDB');
  }
};

export default {
  searchMongoDBProducts,
  searchScrapedProducts,
  generateMockProducts,
  unifiedGrocerySearch
};
