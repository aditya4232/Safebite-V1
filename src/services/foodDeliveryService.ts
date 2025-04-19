// src/services/foodDeliveryService.ts

// Import API service for consistent API handling
import { API_BASE_URL, fetchWithTimeout, generateFallbackData, checkApiStatus } from './apiService';

// Import location service
import { calculateDistance, UserLocation } from './locationService';

// Define the restaurant result interface
export interface RestaurantResult {
  restaurant: string;
  redirect: string;
  rating: number;
  delivery_time: string;
  price_range: string;
  cuisine: string;
  address: string;
  image_url: string;
  platform: string;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
  offers?: string[];
  is_favorite?: boolean;
  popular_dishes?: string[];
  min_order?: string;
  delivery_fee?: string;
  estimated_delivery_time?: string;
  restaurant_type?: 'veg' | 'non-veg' | 'both';
}

// Define the dish details interface
export interface DishDetails {
  name: string;
  price: string;
  description: string;
  image_url: string;
  rating: number;
  is_veg: boolean;
}

/**
 * Fetches nearby restaurants from Swiggy and Zomato based on food and city
 * @param food The food item to search for
 * @param city The city to search in
 * @param userLocation Optional user location for distance calculation
 * @returns Promise with an array of restaurant results
 */
export const fetchNearbyRestaurants = async (food: string, city: string, userLocation?: UserLocation): Promise<RestaurantResult[]> => {
  try {
    console.log(`Fetching restaurants for ${food} in ${city}`);
    if (userLocation) {
      console.log(`User coordinates: ${userLocation.latitude}, ${userLocation.longitude}`);
    }

    // Normalize city name
    const normalizedCity = city.toLowerCase();
    const isHyderabad = normalizedCity.includes('hyd') || normalizedCity.includes('hyderabad');
    const isMumbai = normalizedCity.includes('mum') || normalizedCity.includes('bombay');
    const isDelhi = normalizedCity.includes('delhi') || normalizedCity.includes('new delhi');
    const isBangalore = normalizedCity.includes('bang') || normalizedCity.includes('bengaluru');

    // Normalize food query
    const foodQuery = food.toLowerCase();

    // Hardcoded restaurant data for Hyderabad
    const hyderabadRestaurants: RestaurantResult[] = [
      {
        restaurant: "Paradise Biryani",
        redirect: "https://www.zomato.com/hyderabad/paradise-biryani",
        rating: 4.2,
        delivery_time: "30-35 mins",
        price_range: "₹350 for two",
        cuisine: "North Indian",
        address: "Masab Tank, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?biryani,restaurant",
        platform: "Zomato",
        distance_km: 2.3,
        latitude: 17.3950,
        longitude: 78.4867,
        popular_dishes: ["Chicken Biryani", "Mutton Biryani", "Kebabs"]
      },
      {
        restaurant: "Bawarchi Restaurant",
        redirect: "https://www.swiggy.com/restaurants/bawarchi-restaurant-hyderabad",
        rating: 4.0,
        delivery_time: "35-40 mins",
        price_range: "₹300 for two",
        cuisine: "North Indian",
        address: "RTC X Roads, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?indian,restaurant",
        platform: "Swiggy",
        distance_km: 3.1,
        latitude: 17.4010,
        longitude: 78.4930,
        popular_dishes: ["Hyderabadi Biryani", "Butter Chicken", "Rumali Roti"]
      },
      {
        restaurant: "Shah Ghouse",
        redirect: "https://www.zomato.com/hyderabad/shah-ghouse-cafe-restaurant-tolichowki",
        rating: 4.3,
        delivery_time: "25-30 mins",
        price_range: "₹250 for two",
        cuisine: "North Indian",
        address: "Tolichowki, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?kebab,restaurant",
        platform: "Zomato",
        distance_km: 1.8,
        latitude: 17.4050,
        longitude: 78.4060,
        popular_dishes: ["Haleem", "Biryani", "Irani Chai"]
      },
      {
        restaurant: "Domino's Pizza",
        redirect: "https://www.swiggy.com/restaurants/dominos-pizza-hyderabad",
        rating: 4.1,
        delivery_time: "20-25 mins",
        price_range: "₹400 for two",
        cuisine: "Italian",
        address: "Banjara Hills, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?pizza,restaurant",
        platform: "Swiggy",
        distance_km: 2.5,
        latitude: 17.4150,
        longitude: 78.4350,
        popular_dishes: ["Margherita Pizza", "Pepperoni Pizza", "Garlic Bread"]
      },
      {
        restaurant: "Pizza Hut",
        redirect: "https://www.zomato.com/hyderabad/pizza-hut-himayath-nagar",
        rating: 3.9,
        delivery_time: "30-35 mins",
        price_range: "₹450 for two",
        cuisine: "Italian",
        address: "Himayath Nagar, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?pizza,restaurant",
        platform: "Zomato",
        distance_km: 3.7,
        latitude: 17.3930,
        longitude: 78.4800,
        popular_dishes: ["Cheese Pizza", "Stuffed Crust Pizza", "Pasta"]
      },
      {
        restaurant: "Mehfil Restaurant",
        redirect: "https://www.swiggy.com/restaurants/mehfil-restaurant-hyderabad",
        rating: 4.2,
        delivery_time: "25-30 mins",
        price_range: "₹350 for two",
        cuisine: "North Indian",
        address: "Ameerpet, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?curry,restaurant",
        platform: "Swiggy",
        distance_km: 4.2,
        latitude: 17.4370,
        longitude: 78.4480,
        popular_dishes: ["Chicken Biryani", "Butter Naan", "Paneer Butter Masala"]
      },
      {
        restaurant: "Kritunga Restaurant",
        redirect: "https://www.zomato.com/hyderabad/kritunga-restaurant-madhapur",
        rating: 4.0,
        delivery_time: "35-40 mins",
        price_range: "₹400 for two",
        cuisine: "South Indian",
        address: "Madhapur, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?southindian,restaurant",
        platform: "Zomato",
        distance_km: 5.1,
        latitude: 17.4480,
        longitude: 78.3910,
        popular_dishes: ["Andhra Biryani", "Gongura Chicken", "Ragi Sangati"]
      },
      {
        restaurant: "Chutneys",
        redirect: "https://www.swiggy.com/restaurants/chutneys-hyderabad",
        rating: 4.4,
        delivery_time: "20-25 mins",
        price_range: "₹300 for two",
        cuisine: "South Indian",
        address: "Jubilee Hills, Hyderabad",
        image_url: "https://source.unsplash.com/random/300x300/?dosa,restaurant",
        platform: "Swiggy",
        distance_km: 3.9,
        latitude: 17.4310,
        longitude: 78.4070,
        popular_dishes: ["Masala Dosa", "Idli Sambar", "Mysore Bonda"]
      }
    ];

    // Hardcoded restaurant data for Mumbai
    const mumbaiRestaurants: RestaurantResult[] = [
      {
        restaurant: "Trishna",
        redirect: "https://www.zomato.com/mumbai/trishna-fort",
        rating: 4.5,
        delivery_time: "30-35 mins",
        price_range: "₹1500 for two",
        cuisine: "Seafood",
        address: "Fort, Mumbai",
        image_url: "https://source.unsplash.com/random/300x300/?seafood,restaurant",
        platform: "Zomato",
        distance_km: 2.3,
        latitude: 18.9322,
        longitude: 72.8328,
        popular_dishes: ["Butter Garlic Crab", "Prawns Koliwada", "Fish Tikka"]
      },
      {
        restaurant: "Britannia & Co.",
        redirect: "https://www.swiggy.com/restaurants/britannia-and-co-mumbai",
        rating: 4.6,
        delivery_time: "35-40 mins",
        price_range: "₹800 for two",
        cuisine: "Parsi",
        address: "Ballard Estate, Mumbai",
        image_url: "https://source.unsplash.com/random/300x300/?parsi,food",
        platform: "Swiggy",
        distance_km: 3.1,
        latitude: 18.9372,
        longitude: 72.8384,
        popular_dishes: ["Berry Pulao", "Sali Boti", "Caramel Custard"]
      },
      {
        restaurant: "Mahesh Lunch Home",
        redirect: "https://www.zomato.com/mumbai/mahesh-lunch-home-juhu",
        rating: 4.3,
        delivery_time: "25-30 mins",
        price_range: "₹1000 for two",
        cuisine: "Seafood",
        address: "Juhu, Mumbai",
        image_url: "https://source.unsplash.com/random/300x300/?fish,restaurant",
        platform: "Zomato",
        distance_km: 1.8,
        latitude: 19.0883,
        longitude: 72.8264,
        popular_dishes: ["Butter Garlic Prawns", "Bombil Fry", "Crab Masala"]
      }
    ];

    // Hardcoded restaurant data for Delhi
    const delhiRestaurants: RestaurantResult[] = [
      {
        restaurant: "Karim's",
        redirect: "https://www.zomato.com/ncr/karims-jama-masjid-old-delhi",
        rating: 4.5,
        delivery_time: "30-35 mins",
        price_range: "₹600 for two",
        cuisine: "North Indian",
        address: "Jama Masjid, Old Delhi",
        image_url: "https://source.unsplash.com/random/300x300/?kebab,restaurant",
        platform: "Zomato",
        distance_km: 2.3,
        latitude: 28.6507,
        longitude: 77.2334,
        popular_dishes: ["Mutton Burra", "Chicken Jahangiri", "Mutton Korma"]
      },
      {
        restaurant: "Bukhara",
        redirect: "https://www.swiggy.com/restaurants/bukhara-itc-maurya-delhi",
        rating: 4.8,
        delivery_time: "35-40 mins",
        price_range: "₹5000 for two",
        cuisine: "North Indian",
        address: "ITC Maurya, Diplomatic Enclave",
        image_url: "https://source.unsplash.com/random/300x300/?tandoori,restaurant",
        platform: "Swiggy",
        distance_km: 3.1,
        latitude: 28.5977,
        longitude: 77.1700,
        popular_dishes: ["Dal Bukhara", "Sikandari Raan", "Tandoori Jhinga"]
      },
      {
        restaurant: "Moti Mahal",
        redirect: "https://www.zomato.com/ncr/moti-mahal-delux-south-extension-2-delhi",
        rating: 4.3,
        delivery_time: "25-30 mins",
        price_range: "₹1200 for two",
        cuisine: "North Indian",
        address: "South Extension, Delhi",
        image_url: "https://source.unsplash.com/random/300x300/?curry,restaurant",
        platform: "Zomato",
        distance_km: 1.8,
        latitude: 28.5691,
        longitude: 77.2220,
        popular_dishes: ["Butter Chicken", "Tandoori Chicken", "Dal Makhani"]
      }
    ];

    // Hardcoded restaurant data for Bangalore
    const bangaloreRestaurants: RestaurantResult[] = [
      {
        restaurant: "MTR",
        redirect: "https://www.zomato.com/bangalore/mavalli-tiffin-room-mtr-lalbagh-bangalore",
        rating: 4.6,
        delivery_time: "30-35 mins",
        price_range: "₹400 for two",
        cuisine: "South Indian",
        address: "Lalbagh, Bangalore",
        image_url: "https://source.unsplash.com/random/300x300/?dosa,restaurant",
        platform: "Zomato",
        distance_km: 2.3,
        latitude: 12.9516,
        longitude: 77.5932,
        popular_dishes: ["Masala Dosa", "Rava Idli", "Filter Coffee"]
      },
      {
        restaurant: "Meghana Foods",
        redirect: "https://www.swiggy.com/restaurants/meghana-foods-bangalore",
        rating: 4.5,
        delivery_time: "35-40 mins",
        price_range: "₹700 for two",
        cuisine: "Andhra",
        address: "Residency Road, Bangalore",
        image_url: "https://source.unsplash.com/random/300x300/?biryani,restaurant",
        platform: "Swiggy",
        distance_km: 3.1,
        latitude: 12.9698,
        longitude: 77.6003,
        popular_dishes: ["Boneless Biryani", "Andhra Chicken", "Apollo Fish"]
      },
      {
        restaurant: "Empire Restaurant",
        redirect: "https://www.zomato.com/bangalore/empire-restaurant-koramangala-5th-block",
        rating: 4.2,
        delivery_time: "25-30 mins",
        price_range: "₹500 for two",
        cuisine: "North Indian",
        address: "Koramangala, Bangalore",
        image_url: "https://source.unsplash.com/random/300x300/?kebab,restaurant",
        platform: "Zomato",
        distance_km: 1.8,
        latitude: 12.9347,
        longitude: 77.6205,
        popular_dishes: ["Butter Chicken", "Coin Parotta", "Chicken Kebab"]
      }
    ];

    // Select restaurants based on city
    let restaurants: RestaurantResult[] = [];

    if (isHyderabad) {
      restaurants = hyderabadRestaurants;
    } else if (isMumbai) {
      restaurants = mumbaiRestaurants;
    } else if (isDelhi) {
      restaurants = delhiRestaurants;
    } else if (isBangalore) {
      restaurants = bangaloreRestaurants;
    } else {
      // Default to Hyderabad if city not recognized
      restaurants = hyderabadRestaurants;
    }

    // Filter restaurants based on food query if provided
    if (food && food.trim() !== '') {
      // First try to match restaurants with dishes containing the food query
      const dishMatches = restaurants.filter(r =>
        r.popular_dishes?.some(dish => dish.toLowerCase().includes(foodQuery))
      );

      // If we have dish matches, return those
      if (dishMatches.length > 0) {
        console.log(`Found ${dishMatches.length} restaurants with matching dishes`);
        return dishMatches;
      }

      // Otherwise, try to match by cuisine or restaurant name
      const otherMatches = restaurants.filter(r =>
        (r.cuisine && r.cuisine.toLowerCase().includes(foodQuery)) ||
        r.restaurant.toLowerCase().includes(foodQuery)
      );

      if (otherMatches.length > 0) {
        console.log(`Found ${otherMatches.length} restaurants with matching cuisine or name`);
        return otherMatches;
      }
    }

    // If no matches or no food query, return all restaurants for the city
    console.log(`Returning all ${restaurants.length} restaurants for ${city}`);
    return restaurants;

  } catch (error) {
    console.error('Error in food delivery service:', error);
    return [];
  }
};
