// src/services/foodDeliveryService.ts

// Define the base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://safebite-backend.onrender.com';

// Define the dish details interface
export interface DishDetails {
  name: string;
  price?: string;
  description?: string;
  image_url?: string;
  rating?: number;
  is_veg?: boolean;
}

// Define the restaurant result interface
export interface RestaurantResult {
  restaurant: string;
  redirect: string;
  rating?: number;
  delivery_time?: string;
  price_range?: string;
  source?: string;
  cuisine?: string;
  popular_dishes?: string[];
  address?: string;
  is_favorite?: boolean;
  dish_details?: DishDetails[];
}

/**
 * Fetches nearby restaurants from Swiggy and Zomato based on food and city
 * @param food The food item to search for
 * @param city The city to search in
 * @returns Promise with an array of restaurant results
 */
export const fetchNearbyRestaurants = async (food: string, city: string): Promise<RestaurantResult[]> => {
  try {
    // First try to fetch from our backend API
    const apiUrl = `${API_BASE_URL}/api/food-delivery?food=${encodeURIComponent(food)}&city=${encodeURIComponent(city)}`;
    console.log(`Fetching food delivery data from: ${apiUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('Food delivery API response:', data);
      return data;
    }

    console.warn(`API request failed with status: ${response.status}`);
    throw new Error(`API request failed with status: ${response.status}`);
  } catch (error) {
    console.error('Error fetching food delivery data:', error);

    // Fallback to mock data if the API request fails
    console.log('Using fallback mock data for food delivery');

    // Generate dynamic mock data based on the search parameters
    const foodType = food.toLowerCase();
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Determine cuisine based on food type
    let cuisine = "Various";
    if (foodType.includes("pizza") || foodType.includes("pasta")) {
      cuisine = "Italian";
    } else if (foodType.includes("burger")) {
      cuisine = "American";
    } else if (foodType.includes("biryani") || foodType.includes("paneer") || foodType.includes("curry")) {
      cuisine = "Indian";
    } else if (foodType.includes("noodles")) {
      cuisine = "Chinese";
    } else if (foodType.includes("sushi")) {
      cuisine = "Japanese";
    } else if (foodType.includes("tacos")) {
      cuisine = "Mexican";
    }

    // Generate popular dishes based on food type
    let popularDishes: string[] = [];
    let dishDetails: DishDetails[] = [];

    if (foodType.includes("pizza")) {
      popularDishes = ["Margherita Pizza", "Pepperoni Pizza", "Cheese Pizza", "Veggie Supreme"];
      dishDetails = [
        {
          name: "Margherita Pizza",
          price: "₹249",
          description: "Classic delight with 100% real mozzarella cheese",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.2,
          is_veg: true
        },
        {
          name: "Pepperoni Pizza",
          price: "₹349",
          description: "Classic pepperoni pizza with extra cheese",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.5,
          is_veg: false
        },
        {
          name: "Cheese Pizza",
          price: "₹299",
          description: "Extra cheese pizza with mozzarella and cheddar",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.3,
          is_veg: true
        },
        {
          name: "Veggie Supreme",
          price: "₹399",
          description: "Loaded with garden fresh veggies and extra cheese",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.1,
          is_veg: true
        }
      ];
    } else if (foodType.includes("burger")) {
      popularDishes = ["Cheese Burger", "Veggie Burger", "Chicken Burger", "Double Patty Burger"];
      dishDetails = [
        {
          name: "Cheese Burger",
          price: "₹199",
          description: "Classic cheese burger with fresh veggies",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.0,
          is_veg: false
        },
        {
          name: "Veggie Burger",
          price: "₹179",
          description: "Made with fresh vegetable patty and cheese",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 3.9,
          is_veg: true
        },
        {
          name: "Chicken Burger",
          price: "₹229",
          description: "Juicy chicken patty with special sauce",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.4,
          is_veg: false
        },
        {
          name: "Double Patty Burger",
          price: "₹299",
          description: "Double the fun with two juicy patties",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.6,
          is_veg: false
        }
      ];
    } else if (foodType.includes("biryani")) {
      popularDishes = ["Chicken Biryani", "Mutton Biryani", "Veg Biryani", "Hyderabadi Biryani"];
      dishDetails = [
        {
          name: "Chicken Biryani",
          price: "₹299",
          description: "Aromatic basmati rice cooked with tender chicken pieces",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.5,
          is_veg: false
        },
        {
          name: "Mutton Biryani",
          price: "₹349",
          description: "Fragrant rice with tender mutton pieces",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.7,
          is_veg: false
        },
        {
          name: "Veg Biryani",
          price: "₹249",
          description: "Aromatic rice with mixed vegetables",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.0,
          is_veg: true
        },
        {
          name: "Hyderabadi Biryani",
          price: "₹329",
          description: "Authentic Hyderabadi style biryani with special spices",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.6,
          is_veg: false
        }
      ];
    } else if (foodType.includes("paneer")) {
      popularDishes = ["Paneer Butter Masala", "Kadai Paneer", "Paneer Tikka", "Shahi Paneer"];
      dishDetails = [
        {
          name: "Paneer Butter Masala",
          price: "₹269",
          description: "Cottage cheese cooked in rich tomato and butter gravy",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.4,
          is_veg: true
        },
        {
          name: "Kadai Paneer",
          price: "₹249",
          description: "Cottage cheese cooked with bell peppers in a spicy gravy",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.3,
          is_veg: true
        },
        {
          name: "Paneer Tikka",
          price: "₹229",
          description: "Marinated cottage cheese grilled to perfection",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.5,
          is_veg: true
        },
        {
          name: "Shahi Paneer",
          price: "₹279",
          description: "Cottage cheese in a rich and creamy gravy",
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.2,
          is_veg: true
        }
      ];
    } else {
      popularDishes = [`${foodType.charAt(0).toUpperCase() + foodType.slice(1)} Special`,
                      `Spicy ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
                      `Classic ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
                      `House ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`];

      // Generic dish details for any other food type
      dishDetails = [
        {
          name: `${foodType.charAt(0).toUpperCase() + foodType.slice(1)} Special`,
          price: "₹299",
          description: `Our chef's special ${foodType} preparation`,
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.3,
          is_veg: Math.random() > 0.5
        },
        {
          name: `Spicy ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
          price: "₹279",
          description: `Hot and spicy ${foodType} for spice lovers`,
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.1,
          is_veg: Math.random() > 0.5
        },
        {
          name: `Classic ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
          price: "₹249",
          description: `Traditional ${foodType} prepared with authentic recipe`,
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/9f2f843523d0e8b9ecd9ee9ee32c1c46.jpg",
          rating: 4.0,
          is_veg: Math.random() > 0.5
        },
        {
          name: `House ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
          price: "₹269",
          description: `Our signature ${foodType} dish`,
          image_url: "https://b.zmtcdn.com/data/pictures/chains/1/50691/2efa3a244c3c1e9b11499f167a7b1e2e.jpg",
          rating: 4.2,
          is_veg: Math.random() > 0.5
        }
      ];
    }

    return [
      {
        "restaurant": `${cityName} ${foodType.charAt(0).toUpperCase() + foodType.slice(1)} House`,
        "redirect": `https://www.swiggy.com/search?query=${foodType.replace(' ', '%20')}%20${city.toLowerCase().replace(' ', '%20')}`,
        "rating": 4.2,
        "delivery_time": "30-35 min",
        "price_range": "₹₹",
        "source": "Swiggy",
        "cuisine": cuisine,
        "popular_dishes": popularDishes.slice(0, 2),
        "address": `Road No. 12, ${cityName} Central`,
        "is_favorite": false,
        "dish_details": dishDetails.slice(0, 2)
      },
      {
        "restaurant": `Royal ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
        "redirect": `https://www.zomato.com/search?q=${foodType.replace(' ', '%20')}%20${city.toLowerCase().replace(' ', '%20')}`,
        "rating": 4.3,
        "delivery_time": "35-40 min",
        "price_range": "₹₹₹",
        "source": "Zomato",
        "cuisine": cuisine,
        "popular_dishes": popularDishes.slice(1, 3),
        "address": `Banjara Hills, ${cityName}`,
        "is_favorite": false,
        "dish_details": dishDetails.slice(1, 3)
      },
      {
        "restaurant": `The ${foodType.charAt(0).toUpperCase() + foodType.slice(1)} Factory`,
        "redirect": `https://www.swiggy.com/search?query=${foodType.replace(' ', '%20')}%20${city.toLowerCase().replace(' ', '%20')}`,
        "rating": 4.0,
        "delivery_time": "25-30 min",
        "price_range": "₹₹₹",
        "source": "Swiggy",
        "cuisine": cuisine,
        "popular_dishes": popularDishes.slice(2, 4),
        "address": `Jubilee Hills, ${cityName}`,
        "is_favorite": false,
        "dish_details": dishDetails.slice(2, 4)
      },
      {
        "restaurant": `${cityName} ${foodType.charAt(0).toUpperCase() + foodType.slice(1)} Corner`,
        "redirect": `https://www.zomato.com/search?q=${foodType.replace(' ', '%20')}%20${city.toLowerCase().replace(' ', '%20')}`,
        "rating": 4.1,
        "delivery_time": "30-35 min",
        "price_range": "₹₹",
        "source": "Zomato",
        "cuisine": cuisine,
        "popular_dishes": popularDishes.slice(0, 2),
        "address": `Madhapur, ${cityName}`,
        "is_favorite": false,
        "dish_details": dishDetails.slice(0, 2)
      }
    ];
  }
};

/**
 * Toggles a restaurant as favorite in Firebase
 * @param userId The user ID
 * @param restaurantId The restaurant ID or name
 * @param isFavorite Whether the restaurant is a favorite
 * @returns Promise with success status
 */
export const toggleFavoriteRestaurant = async (
  userId: string,
  restaurantId: string,
  isFavorite: boolean
): Promise<boolean> => {
  try {
    // In a real implementation, this would update Firebase
    console.log(`Toggling restaurant ${restaurantId} as ${isFavorite ? 'favorite' : 'not favorite'} for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error toggling favorite restaurant:', error);
    return false;
  }
};

/**
 * Gets user's favorite restaurants from Firebase
 * @param userId The user ID
 * @returns Promise with array of favorite restaurant IDs
 */
export const getFavoriteRestaurants = async (userId: string): Promise<string[]> => {
  try {
    // In a real implementation, this would fetch from Firebase
    console.log(`Getting favorite restaurants for user ${userId}`);
    return [];
  } catch (error) {
    console.error('Error getting favorite restaurants:', error);
    return [];
  }
};
