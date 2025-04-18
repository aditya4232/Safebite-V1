// Web Scraping Service for SafeBite
// This service uses a backend proxy to scrape restaurant data from food delivery websites

import { fetchRestaurantData } from '@/utils/apiUtils';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

// Restaurant data interface
export interface RestaurantData {
  restaurant: string;
  rating: string;
  delivery_time: string;
  price_range: string;
  cuisine: string;
  address: string;
  popular_dishes: string[];
  image_url?: string;
  source: 'Swiggy' | 'Zomato';
  redirect?: string;
  is_favorite?: boolean;
  dish_details?: DishDetail[];
}

// Dish detail interface
export interface DishDetail {
  name: string;
  price: string;
  description?: string;
  image_url?: string;
  rating?: string;
  is_veg?: boolean;
}

// Cache data in localStorage to reduce API calls
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

class WebScrapingService {
  private db = getFirestore(app);
  private auth = getAuth(app);

  // Search for restaurants by food item and city
  async searchRestaurants(foodItem: string, city: string): Promise<RestaurantData[]> {
    try {
      // Check if we have cached data
      const cacheKey = `restaurant_search_${foodItem}_${city}`;
      const cachedData = this.getCachedData(cacheKey);

      if (cachedData) {
        console.log('Using cached restaurant data');
        return cachedData;
      }

      // Check if we have data in Firebase
      const firestoreData = await this.getFirestoreData(foodItem, city);
      if (firestoreData && firestoreData.length > 0) {
        console.log('Using Firestore restaurant data');
        this.setCachedData(cacheKey, firestoreData);
        return firestoreData;
      }

      // If no cached or Firestore data, make API call to backend
      console.log('Fetching fresh restaurant data from API');
      const data = await fetchRestaurantData(foodItem, city);

      // Process the data to ensure it matches our interface
      const restaurants: RestaurantData[] = data.map((item: any) => {
        // Use restaurant name from either name or restaurant field
        const restaurantName = item.name || item.restaurant || 'Unknown Restaurant';

        return {
          restaurant: restaurantName,
          rating: item.rating?.toString() || '4.0',
          delivery_time: item.delivery_time || '30-40 min',
          price_range: item.price_range || '₹₹',
          cuisine: item.cuisine || 'Various',
          address: item.address || 'Location not available',
          popular_dishes: item.popular_dishes || [],
          image_url: item.image_url || `https://source.unsplash.com/random/300x200/?restaurant,${encodeURIComponent(restaurantName)}`,
          source: item.source || 'Swiggy',
          redirect: item.redirect || '',
          dish_details: (item.dish_details || []).map((dish: any) => ({
            ...dish,
            image_url: dish.image_url || `https://source.unsplash.com/random/300x200/?food,${encodeURIComponent(dish.name || '')}`
          }))
        };
      });

      // Save to Firebase for future use
      await this.saveToFirestore(foodItem, city, restaurants);

      // Cache the data
      this.setCachedData(cacheKey, restaurants);

      return restaurants;
    } catch (error) {
      console.error('Error searching restaurants:', error);

      // Return mock data if API fails
      return this.getMockRestaurantData(foodItem);
    }
  }

  // Get cached data from localStorage
  private getCachedData(key: string): RestaurantData[] | null {
    try {
      const cachedItem = localStorage.getItem(key);
      if (!cachedItem) return null;

      const { data, timestamp } = JSON.parse(cachedItem);
      const now = Date.now();

      // Check if cache is expired
      if (now - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Set cached data in localStorage
  private setCachedData(key: string, data: RestaurantData[]): void {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };

      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  }

  // Save data to Firestore
  private async saveToFirestore(foodItem: string, city: string, data: RestaurantData[]): Promise<void> {
    try {
      const searchRef = doc(this.db, 'restaurant_searches', `${foodItem}_${city}`);
      await setDoc(searchRef, {
        foodItem,
        city,
        results: data,
        timestamp: new Date(),
        searchCount: 1
      }, { merge: true });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  }

  // Get data from Firestore
  private async getFirestoreData(foodItem: string, city: string): Promise<RestaurantData[] | null> {
    try {
      const searchRef = doc(this.db, 'restaurant_searches', `${foodItem}_${city}`);
      const docSnap = await getDoc(searchRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Update search count
        await setDoc(searchRef, {
          searchCount: (data.searchCount || 0) + 1,
          lastSearched: new Date()
        }, { merge: true });

        return data.results;
      }

      return null;
    } catch (error) {
      console.error('Error getting data from Firestore:', error);
      return null;
    }
  }

  // Get user's favorite restaurants
  async getFavoriteRestaurants(): Promise<string[]> {
    try {
      const user = this.auth.currentUser;
      if (!user) return [];

      const userRef = doc(this.db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.favoriteRestaurants || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting favorite restaurants:', error);
      return [];
    }
  }

  // Get mock restaurant data for testing
  private getMockRestaurantData(foodItem: string): RestaurantData[] {
    // Format the food item for better display
    const formattedFood = foodItem.charAt(0).toUpperCase() + foodItem.slice(1).toLowerCase();

    return [
      {
        restaurant: `Hyderabad ${formattedFood} House`,
        rating: '4.2',
        delivery_time: '30-35 min',
        price_range: '₹₹',
        cuisine: 'Various',
        address: 'Road No. 12, Hyderabad Central',
        popular_dishes: [`${formattedFood} Special`, `Spicy ${formattedFood}`],
        source: 'Swiggy',
        redirect: `https://www.swiggy.com/search?query=${encodeURIComponent(foodItem)}`,
        image_url: 'https://source.unsplash.com/random/300x200/?restaurant,indian',
        dish_details: [
          {
            name: `${formattedFood} Special`,
            price: '₹250',
            description: `Delicious ${foodItem.toLowerCase()} prepared in a special way`,
            is_veg: true,
            rating: '4.5',
            image_url: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(foodItem)},food`
          }
        ]
      },
      {
        restaurant: `Royal ${formattedFood}`,
        rating: '4.3',
        delivery_time: '35-40 min',
        price_range: '₹₹₹',
        cuisine: 'Various',
        address: 'Banjara Hills, Hyderabad',
        popular_dishes: [`Spicy ${formattedFood}`, `Classic ${formattedFood}`],
        source: 'Zomato',
        redirect: `https://www.zomato.com/search?q=${encodeURIComponent(foodItem)}`,
        image_url: 'https://source.unsplash.com/random/300x200/?restaurant,fancy',
        dish_details: [
          {
            name: `Classic ${formattedFood}`,
            price: '₹280',
            description: `Traditional ${foodItem.toLowerCase()} with authentic flavors`,
            is_veg: true,
            rating: '4.4',
            image_url: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(foodItem)},dish`
          }
        ]
      },
      {
        restaurant: `The ${formattedFood} Factory`,
        rating: '4',
        delivery_time: '25-30 min',
        price_range: '₹₹₹',
        cuisine: 'Various',
        address: 'Jubilee Hills, Hyderabad',
        popular_dishes: [`${formattedFood} Special`, `Kadai ${formattedFood}`],
        source: 'Swiggy',
        redirect: `https://www.swiggy.com/search?query=${encodeURIComponent(foodItem)}`,
        image_url: 'https://source.unsplash.com/random/300x200/?restaurant,modern',
        dish_details: [
          {
            name: `Kadai ${formattedFood}`,
            price: '₹270',
            description: `Spicy ${foodItem.toLowerCase()} with bell peppers and kadai masala`,
            is_veg: true,
            rating: '4.2',
            image_url: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(foodItem)},spicy`
          }
        ]
      },
      {
        restaurant: `Hyderabad ${formattedFood} Center`,
        rating: '4.1',
        delivery_time: '30-35 min',
        price_range: '₹₹',
        cuisine: 'Various',
        address: 'Madhapur, Hyderabad',
        popular_dishes: [`${formattedFood} Special`, 'Butter Naan'],
        source: 'Zomato',
        redirect: `https://www.zomato.com/search?q=${encodeURIComponent(foodItem)}`,
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
  }
}

export const webScrapingService = new WebScrapingService();
export default webScrapingService;
