// API base URL
export const API_BASE_URL = 'https://safebite-backend.onrender.com';

// For local development, uncomment the line below
// export const API_BASE_URL = 'http://localhost:5000';

// Backup API URL in case the main one is down
export const BACKUP_API_URL = 'https://safebite-api.onrender.com';

// Fallback products data when API is unavailable
export const FALLBACK_PRODUCTS = [
  {
    _id: 'fallback1',
    name: 'Organic Whole Grain Bread',
    brand: "Nature's Best",
    category: 'Bakery',
    description: 'Nutritious whole grain bread made with organic ingredients.',
    ingredients: ['Whole wheat flour', 'Water', 'Yeast', 'Salt', 'Honey'],
    nutritionalInfo: {
      calories: 80,
      protein: 4,
      carbs: 15,
      fat: 1,
      fiber: 3,
      sugar: 1
    },
    allergens: ['Wheat', 'Gluten'],
    dietaryInfo: ['Vegetarian'],
    healthScore: 8,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    price: 3.99,
    tags: ['Organic', 'Whole Grain', 'Bread']
  },
  {
    _id: 'fallback2',
    name: 'Greek Yogurt',
    brand: 'Healthy Dairy',
    category: 'Dairy',
    description: 'Creamy Greek yogurt high in protein and probiotics.',
    ingredients: ['Milk', 'Live active cultures'],
    nutritionalInfo: {
      calories: 120,
      protein: 15,
      carbs: 7,
      fat: 5,
      fiber: 0,
      sugar: 5
    },
    allergens: ['Milk'],
    dietaryInfo: ['Vegetarian', 'Gluten-Free'],
    healthScore: 9,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    price: 2.49,
    tags: ['Protein', 'Probiotic', 'Dairy']
  },
  {
    _id: 'fallback3',
    name: 'Quinoa Salad',
    brand: 'Fresh Meals',
    category: 'Prepared Foods',
    description: 'Ready-to-eat quinoa salad with vegetables and herbs.',
    ingredients: ['Quinoa', 'Bell peppers', 'Cucumber', 'Olive oil', 'Lemon juice', 'Herbs'],
    nutritionalInfo: {
      calories: 220,
      protein: 8,
      carbs: 35,
      fat: 7,
      fiber: 6,
      sugar: 2
    },
    allergens: [],
    dietaryInfo: ['Vegan', 'Gluten-Free'],
    healthScore: 10,
    imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    price: 5.99,
    tags: ['Vegan', 'Protein', 'Ready-to-eat']
  },
  {
    _id: 'fallback4',
    name: 'Almond Butter',
    brand: 'Nut Heaven',
    category: 'Spreads',
    description: 'Creamy almond butter made from roasted almonds.',
    ingredients: ['Roasted almonds'],
    nutritionalInfo: {
      calories: 190,
      protein: 7,
      carbs: 6,
      fat: 17,
      fiber: 3,
      sugar: 1
    },
    allergens: ['Tree nuts'],
    dietaryInfo: ['Vegan', 'Gluten-Free'],
    healthScore: 7,
    imageUrl: 'https://images.unsplash.com/photo-1501012259-39cd25f18b8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    price: 7.99,
    tags: ['Nut butter', 'Protein', 'Natural']
  }
];

/**
 * Check if the API is available
 * @returns Promise<{ isAvailable: boolean, activeUrl: string }> - API status and active URL
 */
export const checkApiStatus = async (): Promise<{ isAvailable: boolean, activeUrl: string }> => {
  // Try main API first
  const mainApiStatus = await tryApiEndpoint(API_BASE_URL);
  if (mainApiStatus) {
    console.log('Main API is available');
    return { isAvailable: true, activeUrl: API_BASE_URL };
  }

  // If main API is down, try backup API
  console.log('Main API is down, trying backup API...');
  const backupApiStatus = await tryApiEndpoint(BACKUP_API_URL);
  if (backupApiStatus) {
    console.log('Backup API is available');
    return { isAvailable: true, activeUrl: BACKUP_API_URL };
  }

  // Both APIs are down
  console.warn('Both main and backup APIs are down');
  return { isAvailable: false, activeUrl: API_BASE_URL };
};

/**
 * Try to connect to an API endpoint
 * @param baseUrl - API base URL to try
 * @returns Promise<boolean> - True if API is available, false otherwise
 */
async function tryApiEndpoint(baseUrl: string): Promise<boolean> {
  try {
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Try to fetch the status endpoint
    // First try /status, then fall back to / if that fails
    let response;
    try {
      response = await fetch(`${baseUrl}/status`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
    } catch (error) {
      console.log(`Error fetching ${baseUrl}/status, trying root endpoint`);
      try {
        response = await fetch(`${baseUrl}/`, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
      } catch (rootError) {
        console.error(`Error fetching ${baseUrl}/: ${rootError}`);
        clearTimeout(timeoutId);
        return false;
      }
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
}

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
    const { isAvailable, activeUrl } = await checkApiStatus();

    if (!isAvailable) {
      console.warn('API is not available, returning fallback data');
      // Return the provided fallback data
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
      const url = `${activeUrl}/api/${collection}?page=${page}&limit=${limit}${
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
          ? `${activeUrl}/products`
          : `${activeUrl}/grocery-products`;

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
        // Return the provided fallback data
        console.warn('All fetch attempts failed, returning fallback data');
        return fallbackData;
      }
    }
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error);
    // Return the provided fallback data
    console.warn('Error during fetch process, returning fallback data');
    return fallbackData;
  }
};

/**
 * Fetch recipes from the API with fallback
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param search - Optional search query
 * @returns Promise with recipe data and pagination info
 */
export const fetchRecipesWithFallback = async (
  page: number = 1,
  limit: number = 20,
  search: string = ''
): Promise<{ recipes: any[], total: number, page: number, totalPages: number }> => {
  try {
    // Use the products fetch function but rename the result
    const result = await fetchProductsWithFallback('products', page, limit, search);

    // Convert the result to the expected format
    return {
      recipes: result.products,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // Return empty fallback data for recipes if fetch fails
    return { recipes: [], total: 0, page: 1, totalPages: 1 };
  }
};

// Remove the JSX component from this file as it's a pure TypeScript utility file
// We'll create a separate React component for the API status indicator

/**
 * Fetch restaurant data from the scraping API
 * @param foodItem - Food item to search for
 * @param city - City to search in
 * @returns Promise with restaurant data
 */
export const fetchRestaurantData = async (
  foodItem: string,
  city: string
): Promise<any[]> => {
  try {
    // Check if API is available first
    const { isAvailable, activeUrl } = await checkApiStatus();

    if (!isAvailable) {
      console.warn('API is not available, returning mock restaurant data');
      // Return mock data
      return getMockRestaurantData(foodItem);
    }

    // API is available, try to fetch restaurant data
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const url = `${activeUrl}/api/scrape/restaurants`;

    console.log(`Fetching restaurant data from: ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ foodItem, city })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      console.log(`Successfully fetched ${data.length} restaurants from API`);
      return data;
    }

    // If we got here, the response format is unexpected
    console.warn('Unexpected API response format for restaurants:', data);
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    // Return mock data as fallback
    return getMockRestaurantData(foodItem);
  }
};

/**
 * Get mock restaurant data for testing
 * @param foodItem - Food item to search for
 * @returns Array of mock restaurant data
 */
const getMockRestaurantData = (foodItem: string): any[] => {
  return [
    {
      name: `Hyderabad ${foodItem} House`,
      restaurant: `Hyderabad ${foodItem} House`,
      rating: '4.2',
      delivery_time: '30-35 min',
      price_range: '₹₹',
      cuisine: 'Various',
      address: 'Road No. 12, Hyderabad Central',
      popular_dishes: [`${foodItem} Special`, `Spicy ${foodItem}`],
      source: 'Swiggy',
      redirect: 'https://www.swiggy.com',
      image_url: 'https://source.unsplash.com/random/300x200/?restaurant,indian',
      dish_details: [
        {
          name: `${foodItem} Special`,
          price: '₹250',
          description: `Delicious ${foodItem.toLowerCase()} prepared in a special way`,
          is_veg: true,
          rating: '4.5',
          image_url: `https://source.unsplash.com/random/300x200/?${foodItem.toLowerCase()},food`
        }
      ]
    },
    {
      name: `Royal ${foodItem}`,
      restaurant: `Royal ${foodItem}`,
      rating: '4.3',
      delivery_time: '35-40 min',
      price_range: '₹₹₹',
      cuisine: 'Various',
      address: 'Banjara Hills, Hyderabad',
      popular_dishes: [`Spicy ${foodItem}`, `Classic ${foodItem}`],
      source: 'Zomato',
      redirect: 'https://www.zomato.com',
      image_url: 'https://source.unsplash.com/random/300x200/?restaurant,fancy',
      dish_details: [
        {
          name: `Classic ${foodItem}`,
          price: '₹280',
          description: `Traditional ${foodItem.toLowerCase()} with authentic flavors`,
          is_veg: true,
          rating: '4.4',
          image_url: `https://source.unsplash.com/random/300x200/?${foodItem.toLowerCase()},dish`
        }
      ]
    },
    {
      name: `The ${foodItem} Factory`,
      restaurant: `The ${foodItem} Factory`,
      rating: '4',
      delivery_time: '25-30 min',
      price_range: '₹₹₹',
      cuisine: 'Various',
      address: 'Jubilee Hills, Hyderabad',
      popular_dishes: [`${foodItem} Special`, `Kadai ${foodItem}`],
      source: 'Swiggy',
      redirect: 'https://www.swiggy.com',
      image_url: 'https://source.unsplash.com/random/300x200/?restaurant,modern',
      dish_details: [
        {
          name: `Kadai ${foodItem}`,
          price: '₹270',
          description: `Spicy ${foodItem.toLowerCase()} with bell peppers and kadai masala`,
          is_veg: true,
          rating: '4.2',
          image_url: `https://source.unsplash.com/random/300x200/?${foodItem.toLowerCase()},spicy`
        }
      ]
    },
    {
      name: `Hyderabad ${foodItem} Center`,
      restaurant: `Hyderabad ${foodItem} Center`,
      rating: '4.1',
      delivery_time: '30-35 min',
      price_range: '₹₹',
      cuisine: 'Various',
      address: 'Madhapur, Hyderabad',
      popular_dishes: [`${foodItem} Special`, 'Butter Naan'],
      source: 'Zomato',
      redirect: 'https://www.zomato.com',
      image_url: 'https://source.unsplash.com/random/300x200/?restaurant,traditional',
      dish_details: [
        {
          name: 'Butter Naan',
          price: '₹50',
          description: 'Soft buttery naan bread',
          is_veg: true,
          rating: '4.3',
          image_url: 'https://source.unsplash.com/random/300x200/?naan,bread'
        }
      ]
    }
  ];
};

export default {
  API_BASE_URL,
  BACKUP_API_URL,
  FALLBACK_PRODUCTS,
  checkApiStatus,
  fetchProductsWithFallback,
  fetchRecipesWithFallback,
  fetchRestaurantData
};
