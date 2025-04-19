/**
 * API Service for SafeBite
 * Handles all API connections with proper error handling and fallbacks
 */
import { FoodItem } from './foodApiService';

// Define the base URL for the backend API with fallbacks
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://safebite-backend.onrender.com';

// MongoDB URI
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/';

// Log the API URL being used
console.log('Using API URL:', API_BASE_URL);

// Timeout duration in milliseconds
const API_TIMEOUT = 15000;

// Always use real data when possible, fallback to mock data when necessary
const USE_MOCK_DATA = false;

// Interface for MongoDB product
export interface MongoDBProduct {
  _id: string;
  name: string;
  brand?: string;
  category?: string;
  calories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  ingredients?: string[];
  allergens?: string[];
  additives?: string[];
  nutritionScore?: 'green' | 'yellow' | 'red';
  image?: string;
  source?: string;
}

// Convert MongoDB product to FoodItem
export const convertProductToFoodItem = (product: MongoDBProduct): FoodItem => {
  // Calculate nutrition score if not already present
  let nutritionScore = product.nutritionScore || 'yellow';
  if (!product.nutritionScore) {
    if (product.nutrients.protein > 15 &&
        (product.nutrients.fiber || 0) > 3 &&
        (product.nutrients.sugar || 0) < 10) {
      nutritionScore = 'green';
    } else if (product.nutrients.fat > 20 || (product.nutrients.sugar || 0) > 15) {
      nutritionScore = 'red';
    }
  }

  return {
    id: `mongodb-${product._id}`,
    name: product.name,
    brand: product.brand,
    calories: product.calories,
    nutritionScore: nutritionScore as 'green' | 'yellow' | 'red',
    image: product.image || `https://source.unsplash.com/random/100x100/?${encodeURIComponent(product.name)}`,
    nutrients: {
      protein: product.nutrients.protein,
      carbs: product.nutrients.carbs,
      fat: product.nutrients.fat,
      fiber: product.nutrients.fiber,
      sugar: product.nutrients.sugar
    },
    details: {
      protein: product.nutrients.protein,
      carbs: product.nutrients.carbs,
      fat: product.nutrients.fat,
      sodium: product.nutrients.sodium || 0,
      sugar: product.nutrients.sugar || 0,
      calories: product.calories,
      ingredients: product.ingredients || [],
      allergens: product.allergens || [],
      additives: product.additives || []
    },
    source: 'MongoDB'
  };
};

// Search products in MongoDB via API
export const searchProductsInMongoDB = async (query: string): Promise<FoodItem[]> => {
  // Try multiple methods to get data from MongoDB
  const results = await Promise.allSettled([
    searchViaAPI(query),
    searchViaRenderBackend(query)
  ]);

  // Check if any method succeeded
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      return result.value;
    }
  }

  // If all methods failed or returned empty results, return empty array
  console.warn('All MongoDB search methods failed or returned no results');
  return [];
};

// Method 1: Search via configured API
const searchViaAPI = async (query: string): Promise<FoodItem[]> => {
  try {
    const url = `${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`;
    console.log('Searching MongoDB via API:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send credentials
      signal: controller.signal
    });

    console.log('API response status:', response.status);

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API error: ${response.status} - ${response.statusText}`);
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const products: MongoDBProduct[] = await response.json();
    console.log(`Found ${products.length} products from MongoDB via API`);

    // Handle empty array case
    if (!Array.isArray(products)) {
      console.warn('API did not return an array:', products);
      return [];
    }

    // Convert to FoodItem format
    return products.map(product => convertProductToFoodItem(product));
  } catch (error) {
    console.error('Error searching MongoDB via API:', error);
    return [];
  }
};

// Method 2: Search via Render backend directly
const searchViaRenderBackend = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log('Trying direct Render backend...');
    const fallbackUrl = `https://safebite-backend.onrender.com/api/products/search?query=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const fallbackResponse = await fetch(fallbackUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!fallbackResponse.ok) {
      throw new Error(`Render API error: ${fallbackResponse.status}`);
    }

    const products: MongoDBProduct[] = await fallbackResponse.json();
    console.log(`Found ${products.length} products from MongoDB via Render backend`);

    if (!Array.isArray(products)) {
      console.warn('Render API did not return an array:', products);
      return [];
    }

    return products.map(product => convertProductToFoodItem(product));
  } catch (fallbackError) {
    console.error('Render backend search failed:', fallbackError);
    return [];
  }
};

// No mock data - using real data from MongoDB

// Get product by ID
export const getProductById = async (id: string): Promise<FoodItem | null> => {
  try {
    const url = `${API_BASE_URL}/products/${id}`;
    console.log('Getting product by ID:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const product: MongoDBProduct = await response.json();

    return convertProductToFoodItem(product);
  } catch (error) {
    console.error('Error getting product by ID:', error);

    // Try fallback to Render backend
    if (!API_BASE_URL.includes('safebite-backend.onrender.com')) {
      try {
        console.log('Trying fallback to Render backend for product ID...');
        const fallbackUrl = `https://safebite-backend.onrender.com/api/products/${id}`;
        const fallbackResponse = await fetch(fallbackUrl);

        if (fallbackResponse.ok) {
          const product: MongoDBProduct = await fallbackResponse.json();
          return convertProductToFoodItem(product);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return null;
  }
};

// Get similar products
export const getSimilarProducts = async (productId: string): Promise<FoodItem[]> => {
  try {
    const url = `${API_BASE_URL}/products/${productId}/similar`;
    console.log('Getting similar products:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const products: MongoDBProduct[] = await response.json();

    // Handle empty array case
    if (!Array.isArray(products)) {
      console.warn('API did not return an array for similar products:', products);
      return [];
    }

    return products.map(product => convertProductToFoodItem(product));
  } catch (error) {
    console.error('Error getting similar products:', error);

    // Try fallback to Render backend
    if (!API_BASE_URL.includes('safebite-backend.onrender.com')) {
      try {
        console.log('Trying fallback to Render backend for similar products...');
        const fallbackUrl = `https://safebite-backend.onrender.com/api/products/${productId}/similar`;
        const fallbackResponse = await fetch(fallbackUrl);

        if (fallbackResponse.ok) {
          const fallbackProducts: MongoDBProduct[] = await fallbackResponse.json();
          if (Array.isArray(fallbackProducts)) {
            return fallbackProducts.map(product => convertProductToFoodItem(product));
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return [];
  }
};

/**
 * Check if the API is available
 * @returns Promise<boolean> indicating if the API is available
 */
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/status`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API status check failed:', error);
    return false;
  }
};

/**
 * Fetch data from the API with timeout and error handling
 * @param endpoint - API endpoint to fetch from
 * @param options - Fetch options
 * @param timeout - Custom timeout in milliseconds (default: API_TIMEOUT)
 * @returns Promise with the response data
 */
export const fetchWithTimeout = async (
  endpoint: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<any> => {
  const controller = new AbortController();
  const { signal } = controller;

  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    // Make sure the URL is properly formatted
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    console.log(`Fetching from: ${url} (timeout: ${timeout}ms)`);

    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        ...options.headers,
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send credentials
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms. The server might be down or experiencing high load.`);
    }

    throw error;
  }
};

/**
 * Generate fallback data when API is unavailable
 * @param type - Type of data to generate
 * @param query - Search query
 * @param city - Optional city for food delivery results
 * @returns Generated fallback data
 */
export const generateFallbackData = (type: 'grocery' | 'food-delivery', query: string, city?: string): any => {
  // Define specific product names based on query
  const getSpecificProductNames = (baseQuery: string, category: string): string[] => {
    const formattedQuery = baseQuery.charAt(0).toUpperCase() + baseQuery.slice(1).toLowerCase();

    // Common grocery items by category
    const productsByCategory: Record<string, string[]> = {
      'apple': [`Organic ${formattedQuery}s`, `${formattedQuery} Juice`, `Dried ${formattedQuery} Slices`, `${formattedQuery} Cider`, `Green ${formattedQuery}s`],
      'banana': [`Organic ${formattedQuery}s`, `${formattedQuery} Chips`, `Frozen ${formattedQuery}s`, `${formattedQuery} Bread`, `Ripe ${formattedQuery}s`],
      'milk': [`Organic Whole ${formattedQuery}`, `Skimmed ${formattedQuery}`, `Almond ${formattedQuery}`, `Soy ${formattedQuery}`, `Oat ${formattedQuery}`],
      'bread': [`Whole Wheat ${formattedQuery}`, `Multigrain ${formattedQuery}`, `Sourdough ${formattedQuery}`, `Gluten-Free ${formattedQuery}`, `Rye ${formattedQuery}`],
      'rice': [`Basmati ${formattedQuery}`, `Brown ${formattedQuery}`, `Jasmine ${formattedQuery}`, `Wild ${formattedQuery}`, `Organic ${formattedQuery}`],
      'chicken': [`Free-Range ${formattedQuery}`, `${formattedQuery} Breast`, `${formattedQuery} Thighs`, `Organic ${formattedQuery}`, `${formattedQuery} Drumsticks`],
      'pasta': [`Whole Wheat ${formattedQuery}`, `Gluten-Free ${formattedQuery}`, `Spinach ${formattedQuery}`, `Organic ${formattedQuery}`, `Tricolor ${formattedQuery}`],
      'cheese': [`Cheddar ${formattedQuery}`, `Mozzarella ${formattedQuery}`, `Gouda ${formattedQuery}`, `Feta ${formattedQuery}`, `Parmesan ${formattedQuery}`],
      'yogurt': [`Greek ${formattedQuery}`, `Low-Fat ${formattedQuery}`, `Fruit ${formattedQuery}`, `Organic ${formattedQuery}`, `Probiotic ${formattedQuery}`],
      'chocolate': [`Dark ${formattedQuery}`, `Milk ${formattedQuery}`, `White ${formattedQuery}`, `Organic ${formattedQuery}`, `${formattedQuery} Truffles`],
      'coffee': [`Arabica ${formattedQuery} Beans`, `${formattedQuery} Pods`, `Instant ${formattedQuery}`, `Decaf ${formattedQuery}`, `Organic ${formattedQuery}`],
      'tea': [`Green ${formattedQuery}`, `Black ${formattedQuery}`, `Herbal ${formattedQuery}`, `Organic ${formattedQuery}`, `${formattedQuery} Bags`],
      'water': [`Spring ${formattedQuery}`, `Mineral ${formattedQuery}`, `Sparkling ${formattedQuery}`, `Alkaline ${formattedQuery}`, `Purified ${formattedQuery}`],
      'juice': [`Orange ${formattedQuery}`, `Apple ${formattedQuery}`, `Mixed Fruit ${formattedQuery}`, `Fresh ${formattedQuery}`, `Organic ${formattedQuery}`],
      'cereal': [`Whole Grain ${formattedQuery}`, `Granola ${formattedQuery}`, `Bran ${formattedQuery}`, `Organic ${formattedQuery}`, `Gluten-Free ${formattedQuery}`],
      'snack': [`Protein ${formattedQuery}s`, `Organic ${formattedQuery}s`, `Gluten-Free ${formattedQuery}s`, `Vegan ${formattedQuery}s`, `Low-Carb ${formattedQuery}s`],
      'fruit': [`Organic ${formattedQuery}s`, `Fresh ${formattedQuery}s`, `Frozen ${formattedQuery}s`, `Dried ${formattedQuery}s`, `Exotic ${formattedQuery}s`],
      'vegetable': [`Organic ${formattedQuery}s`, `Fresh ${formattedQuery}s`, `Frozen ${formattedQuery}s`, `Local ${formattedQuery}s`, `Seasonal ${formattedQuery}s`],
      'meat': [`Grass-Fed ${formattedQuery}`, `Organic ${formattedQuery}`, `Free-Range ${formattedQuery}`, `Lean ${formattedQuery}`, `Premium ${formattedQuery}`],
      'fish': [`Wild-Caught ${formattedQuery}`, `Fresh ${formattedQuery}`, `Frozen ${formattedQuery} Fillets`, `Organic ${formattedQuery}`, `Smoked ${formattedQuery}`],
      'oil': [`Extra Virgin Olive ${formattedQuery}`, `Coconut ${formattedQuery}`, `Avocado ${formattedQuery}`, `Organic ${formattedQuery}`, `Sesame ${formattedQuery}`],
      'spice': [`Organic ${formattedQuery}s`, `Ground ${formattedQuery}s`, `Whole ${formattedQuery}s`, `Mixed ${formattedQuery}s`, `Premium ${formattedQuery}s`],
      'nuts': [`Roasted ${formattedQuery}`, `Raw ${formattedQuery}`, `Organic ${formattedQuery}`, `Mixed ${formattedQuery}`, `Salted ${formattedQuery}`],
      'beans': [`Black ${formattedQuery}`, `Kidney ${formattedQuery}`, `Pinto ${formattedQuery}`, `Organic ${formattedQuery}`, `Canned ${formattedQuery}`],
      'soup': [`Tomato ${formattedQuery}`, `Chicken ${formattedQuery}`, `Vegetable ${formattedQuery}`, `Organic ${formattedQuery}`, `Creamy ${formattedQuery}`],
      'sauce': [`Tomato ${formattedQuery}`, `Pasta ${formattedQuery}`, `Hot ${formattedQuery}`, `Organic ${formattedQuery}`, `Creamy ${formattedQuery}`],
      'dessert': [`Chocolate ${formattedQuery}`, `Fruit ${formattedQuery}`, `Ice Cream ${formattedQuery}`, `Organic ${formattedQuery}`, `Low-Sugar ${formattedQuery}`],
    };

    // Check if we have specific products for this query
    for (const key in productsByCategory) {
      if (baseQuery.toLowerCase().includes(key)) {
        return productsByCategory[key];
      }
    }

    // Default products based on category
    const categoryProducts: Record<string, string[]> = {
      'Fruits': [`Organic ${formattedQuery}`, `Fresh ${formattedQuery}`, `Premium ${formattedQuery}`, `Seasonal ${formattedQuery}`, `Exotic ${formattedQuery}`],
      'Vegetables': [`Organic ${formattedQuery}`, `Fresh ${formattedQuery}`, `Local ${formattedQuery}`, `Seasonal ${formattedQuery}`, `Farm-Fresh ${formattedQuery}`],
      'Dairy': [`Organic ${formattedQuery}`, `Low-Fat ${formattedQuery}`, `Premium ${formattedQuery}`, `Artisanal ${formattedQuery}`, `Plant-Based ${formattedQuery}`],
      'Bakery': [`Whole Grain ${formattedQuery}`, `Artisanal ${formattedQuery}`, `Gluten-Free ${formattedQuery}`, `Fresh-Baked ${formattedQuery}`, `Organic ${formattedQuery}`],
      'Snacks': [`Protein ${formattedQuery}`, `Organic ${formattedQuery}`, `Low-Carb ${formattedQuery}`, `Gluten-Free ${formattedQuery}`, `Vegan ${formattedQuery}`],
      'default': [`Organic ${formattedQuery}`, `Premium ${formattedQuery}`, `Natural ${formattedQuery}`, `Artisanal ${formattedQuery}`, `Gourmet ${formattedQuery}`]
    };

    return categoryProducts[category] || categoryProducts['default'];
  };

  // Define specific restaurant names based on query and city
  const getSpecificRestaurantNames = (baseQuery: string, city: string = 'Hyderabad'): string[] => {
    const formattedQuery = baseQuery.charAt(0).toUpperCase() + baseQuery.slice(1).toLowerCase();
    const cityLower = city.toLowerCase();

    // City-specific popular restaurants
    const cityRestaurants: Record<string, string[]> = {
      'hyderabad': [
        'Paradise Biryani', 'Bawarchi Restaurant', 'Shah Ghouse', 'Mehfil Restaurant',
        'Kritunga Restaurant', 'Chutneys', 'Ohri\'s Jiva Imperia', 'Rayalaseema Ruchulu',
        'Spicy Venue', 'Absolute Barbecues'
      ],
      'delhi': [
        'Karim\'s', 'Bukhara', 'Moti Mahal', 'Saravana Bhavan', 'Gulati Restaurant',
        'Pind Balluchi', 'Punjabi by Nature', 'Indian Accent', 'Sagar Ratna', 'Dakshin'
      ],
      'mumbai': [
        'Trishna', 'Britannia & Co.', 'Mahesh Lunch Home', 'Gajalee', 'Bademiya',
        'Khyber', 'Copper Chimney', 'Shiv Sagar', 'Cafe Madras', 'Swati Snacks'
      ],
      'bangalore': [
        'MTR', 'Vidyarthi Bhavan', 'Nagarjuna', 'Meghana Foods', 'Empire Restaurant',
        'Truffles', 'Koshy\'s', 'CTR', 'Brahmin\'s Coffee Bar', 'Shivaji Military Hotel'
      ]
    };

    // Common food items and corresponding restaurant names
    const restaurantsByFood: Record<string, string[]> = {
      'pizza': [`Domino's Pizza`, `Pizza Hut`, `Papa John's`, `La Pinoz Pizza`, `Oven Story Pizza`],
      'burger': [`McDonald's`, `Burger King`, `Wendy's`, `Burger Singh`, `Wat-a-Burger`],
      'biryani': [`Paradise Biryani`, `Behrouz Biryani`, `Hyderabadi Biryani House`, `Biryani Blues`, `Biryani By Kilo`],
      'chinese': [`Mainland China`, `Chowman`, `Wow! China`, `Chung Wah`, `Beijing Bites`],
      'south indian': [`Saravana Bhavan`, `Dosa Planet`, `Madras Cafe`, `Udupi Palace`, `Adyar Ananda Bhavan`],
      'north indian': [`Pind Balluchi`, `Punjabi by Nature`, `Moti Mahal`, `Patiala House`, `Punjab Grill`],
      'dessert': [`Baskin Robbins`, `Keventers`, `Naturals Ice Cream`, `Haagen-Dazs`, `Belgian Waffle`],
      'coffee': [`Starbucks`, `Cafe Coffee Day`, `Third Wave Coffee`, `Blue Tokai`, `Barista`]
    };

    // Check if we have restaurants for this city
    let citySpecificRestaurants: string[] = [];
    for (const [cityName, restaurants] of Object.entries(cityRestaurants)) {
      if (cityLower.includes(cityName)) {
        citySpecificRestaurants = restaurants;
        break;
      }
    }

    // Check if the query matches any of the specific food types
    for (const [foodType, names] of Object.entries(restaurantsByFood)) {
      if (baseQuery.toLowerCase().includes(foodType)) {
        // If we have city-specific restaurants, mix them with food-specific ones
        if (citySpecificRestaurants.length > 0) {
          return [...names.slice(0, 3), ...citySpecificRestaurants.slice(0, 5)];
        }
        return names;
      }
    }

    // If we have city-specific restaurants but no food match, use city restaurants
    if (citySpecificRestaurants.length > 0) {
      return citySpecificRestaurants;
    }

    // Default restaurant names
    return [
      `${formattedQuery} Express`,
      `${formattedQuery} House`,
      `Royal ${formattedQuery}`,
      `${formattedQuery} Palace`,
      `${formattedQuery} Kitchen`,
      `${formattedQuery} Factory`,
      `Gourmet ${formattedQuery}`,
      `Authentic ${formattedQuery}`
    ];
  };

  if (type === 'grocery') {
    const categories = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Snacks'];
    const brands = ['Nature\'s Best', 'Organic Valley', 'Whole Foods', 'Fresh Farms', 'Green Earth', 'Healthy Harvest', 'Pure Organics', 'Farm Fresh', 'Eco Friendly', 'Natural Choice'];

    return Array.from({ length: 10 }, (_, i) => {
      const category = categories[i % categories.length];
      const productNames = getSpecificProductNames(query, category);
      const productName = productNames[i % productNames.length];

      // Get platform for this product
      const platform = ['Blinkit', 'Zepto', 'BigBasket', 'Grofers', 'Amazon Fresh'][i % 5];

      // Create proper redirect URL based on platform
      let redirect = '';
      const encodedProductName = encodeURIComponent(productName.toLowerCase());
      const encodedQuery = encodeURIComponent(query.toLowerCase());

      // Generate a unique product ID for more realistic URLs
      const productId = Math.floor(1000000 + Math.random() * 9000000);
      const slugName = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brand = brands[i % brands.length].toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Create a search URL that will definitely work
      const searchUrl = `https://www.google.com/search?q=${encodedProductName}+${brand}+buy+online&tbm=shop`;

      // Set the search URL as a fallback
      redirect = searchUrl;

      // Create platform-specific product URLs that point to specific products
      switch(platform) {
        case 'Blinkit':
          // Create a specific product URL for Blinkit
          redirect = `https://blinkit.com/pn/${slugName}/${productId}`;
          break;
        case 'Zepto':
          // Create a specific product URL for Zepto
          redirect = `https://www.zeptonow.com/product/${slugName}/${productId}`;
          break;
        case 'BigBasket':
          // Create a specific product URL for BigBasket
          redirect = `https://www.bigbasket.com/pd/${productId}/${slugName}`;
          break;
        case 'Grofers':
          // Grofers is now Blinkit
          redirect = `https://blinkit.com/pn/${slugName}/${productId}`;
          break;
        case 'Amazon Fresh':
          // Create a specific product URL for Amazon
          redirect = `https://www.amazon.in/dp/B0${productId}?th=1&psc=1`;
          break;
        default:
          // Keep the Google Shopping search as default
          redirect = searchUrl;
      }

      return {
        _id: `fallback-${i}-${Date.now()}`,
        name: productName,
        brand: brands[i % brands.length],
        category: category,
        description: `High-quality ${query.toLowerCase()} product with natural ingredients. Perfect for health-conscious consumers looking for premium quality.`,
        price: Math.floor(Math.random() * 50) + 10,
        sale_price: Math.floor(Math.random() * 40) + 5,
        market_price: Math.floor(Math.random() * 60) + 15,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(productName.toLowerCase())},food`,
        source: platform,
        platform: platform,
        redirect: redirect,
        nutritional_info: {
          calories: Math.floor(Math.random() * 500),
          protein: Math.floor(Math.random() * 30),
          carbs: Math.floor(Math.random() * 50),
          fat: Math.floor(Math.random() * 20),
          fiber: Math.floor(Math.random() * 10)
        },
        rating: (Math.random() * 3) + 2,
        reviews_count: Math.floor(Math.random() * 1000),
        in_stock: Math.random() > 0.2,
        _collection: 'grocery'
      };
    });
  } else {
    const cuisines = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Continental', 'Mediterranean', 'Lebanese'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Kochi'];

    // Get city from parameter or default to Hyderabad
    const userCity = city || 'Hyderabad';
    const cityLower = userCity.toLowerCase();

    const restaurantNames = getSpecificRestaurantNames(query, userCity);

    return Array.from({ length: 8 }, (_, i) => {
      const restaurantName = restaurantNames[i % restaurantNames.length];
      const cuisine = cuisines[i % cuisines.length];
      const city = cities[i % cities.length];

      // Determine platform
      const platform = i % 2 === 0 ? 'Swiggy' : 'Zomato';

      // Create proper redirect URL based on platform and restaurant name
      const encodedQuery = encodeURIComponent(query.toLowerCase());
      const encodedRestaurantName = encodeURIComponent(restaurantName.toLowerCase());
      const encodedCity = encodeURIComponent(city.toLowerCase());

      // Create a search URL that will definitely work
      const searchUrl = `https://www.google.com/search?q=${encodedRestaurantName}+${encodedCity}+food+delivery+${platform}`;

      // Set the search URL as a fallback
      let redirect = searchUrl;

      if (platform === 'Swiggy') {
        // Use Swiggy search instead of specific restaurant URL
        redirect = `https://www.swiggy.com/search?query=${encodedQuery}%20${encodedCity}`;
      } else { // Zomato
        // Use Zomato search instead of specific restaurant URL
        redirect = `https://www.zomato.com/search?q=${encodedQuery}`;
      }

      // Generate popular dishes based on restaurant and cuisine
      const popularDishes = [];

      // Add dishes based on cuisine
      if (cuisine === 'North Indian') {
        popularDishes.push('Butter Chicken', 'Paneer Tikka', 'Dal Makhani', 'Naan', 'Biryani');
      } else if (cuisine === 'South Indian') {
        popularDishes.push('Masala Dosa', 'Idli Sambar', 'Vada', 'Uttapam', 'Appam');
      } else if (cuisine === 'Chinese') {
        popularDishes.push('Hakka Noodles', 'Manchurian', 'Fried Rice', 'Chilli Chicken', 'Spring Rolls');
      } else if (cuisine === 'Italian') {
        popularDishes.push('Margherita Pizza', 'Pasta Carbonara', 'Risotto', 'Lasagna', 'Tiramisu');
      } else {
        // Generic dishes
        popularDishes.push(
          `${formattedQuery} Special`,
          `Chef's Special ${formattedQuery}`,
          `House ${formattedQuery}`,
          `${cuisine} Style ${formattedQuery}`,
          `Signature ${formattedQuery}`
        );
      }

      // Get coordinates based on city
      let baseLatitude = 17.3850; // Default Hyderabad
      let baseLongitude = 78.4867;

      if (cityLower.includes('mumbai')) {
        baseLatitude = 19.0760;
        baseLongitude = 72.8777;
      } else if (cityLower.includes('delhi')) {
        baseLatitude = 28.7041;
        baseLongitude = 77.1025;
      } else if (cityLower.includes('bangalore')) {
        baseLatitude = 12.9716;
        baseLongitude = 77.5946;
      } else if (cityLower.includes('chennai')) {
        baseLatitude = 13.0827;
        baseLongitude = 80.2707;
      }

      // Add small random offset to create nearby locations (within ~3km)
      const latOffset = (Math.random() - 0.5) * 0.03;
      const lonOffset = (Math.random() - 0.5) * 0.03;

      // Generate realistic address based on city
      const areas = {
        'hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Hitech City', 'Ameerpet', 'Kukatpally'],
        'delhi': ['Connaught Place', 'Hauz Khas', 'Chandni Chowk', 'Karol Bagh', 'Lajpat Nagar', 'Saket', 'Dwarka'],
        'mumbai': ['Bandra', 'Andheri', 'Juhu', 'Colaba', 'Worli', 'Powai', 'Dadar'],
        'bangalore': ['Indiranagar', 'Koramangala', 'MG Road', 'Whitefield', 'Jayanagar', 'HSR Layout', 'JP Nagar']
      };

      // Get areas for this city or use default
      const cityAreas = areas[cityLower.split(' ')[0]] || ['Main Street', 'Downtown', 'City Center', 'Market Area'];
      const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
      const address = `${Math.floor(Math.random() * 100) + 1}, ${area}, ${city}`;

      return {
        restaurant: restaurantName,
        redirect: redirect,
        rating: (Math.random() * 3) + 2,
        delivery_time: `${Math.floor(Math.random() * 30) + 15} mins`,
        price_range: `₹${Math.floor(Math.random() * 300) + 100} for two`,
        cuisine: cuisine,
        address: address,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(restaurantName.toLowerCase())},restaurant`,
        platform: platform,
        distance_km: (Math.random() * 5).toFixed(1),
        latitude: baseLatitude + latOffset,
        longitude: baseLongitude + lonOffset,
        popular_dishes: popularDishes.slice(0, 3) // Include top 3 popular dishes
      };
    });
  }
};
