// Grocery Scraping Service for SafeBite
// This service scrapes grocery product data from various sources when MongoDB has no results

import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

// Grocery product interface
export interface GroceryProduct {
  _id?: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  price?: number;
  sale_price?: number;
  market_price?: number;
  image_url?: string;
  source: 'Blinkit' | 'Zepto' | 'Instamart' | 'BigBasket' | 'Other';
  redirect?: string;
  is_favorite?: boolean;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
  offers?: string[];
  rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
  delivery_time?: string;
  _collection?: 'grocery';
}

// Cache data in localStorage to reduce API calls
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

class GroceryScrapingService {
  private db = getFirestore(app);
  private auth = getAuth(app);

  // Search for grocery products by name
  async searchGroceryProducts(query: string): Promise<GroceryProduct[]> {
    try {
      // Check if we have cached data
      const cacheKey = `grocery_search_${query}`;
      const cachedData = this.getCachedData(cacheKey);

      if (cachedData) {
        console.log('Using cached grocery data');
        return cachedData;
      }

      // Check if we have data in Firebase
      const firestoreData = await this.getFirestoreData(query);
      if (firestoreData && firestoreData.length > 0) {
        console.log('Using Firestore grocery data');
        this.setCachedData(cacheKey, firestoreData);
        return firestoreData;
      }

      // If no cached or Firestore data, scrape from sources
      console.log('Scraping fresh grocery data');
      const products = await this.scrapeGroceryProducts(query);

      // Save to Firebase for future use
      await this.saveToFirestore(query, products);

      // Cache the data
      this.setCachedData(cacheKey, products);

      return products;
    } catch (error) {
      console.error('Error searching grocery products:', error);

      // Return mock data if scraping fails
      return this.getMockGroceryProducts(query);
    }
  }

  // Scrape grocery products from various sources
  private async scrapeGroceryProducts(query: string): Promise<GroceryProduct[]> {
    try {
      // Make API call to backend scraper
      const response = await fetch(`https://safebite-backend.onrender.com/api/grocery/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.results) && data.results.length > 0) {
        // Transform the API response to match our GroceryProduct interface
        return data.results.map((item: any) => ({
          _id: item._id || `${item.name}-${Date.now()}`,
          name: item.name || item.product || 'Unknown Product',
          brand: item.brand || '',
          category: item.category || '',
          description: item.description || '',
          price: item.price || 0,
          sale_price: item.sale_price || item.price,
          market_price: item.market_price || item.price,
          image_url: item.image_url || `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},grocery`,
          source: item.source || 'Other',
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

      // If API returns no results, fall back to mock data
      console.log('API returned no results, using mock data');
      return this.getMockGroceryProducts(query);
    } catch (error) {
      console.error('Error scraping grocery products:', error);
      // Fall back to mock data if API fails
      return this.getMockGroceryProducts(query);
    }
  }

  // Get cached data from localStorage
  private getCachedData(key: string): GroceryProduct[] | null {
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
  private setCachedData(key: string, data: GroceryProduct[]): void {
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
  private async saveToFirestore(query: string, data: GroceryProduct[]): Promise<void> {
    try {
      const searchRef = doc(this.db, 'grocery_searches', query.toLowerCase());
      await setDoc(searchRef, {
        query,
        results: data,
        timestamp: new Date(),
        searchCount: 1
      }, { merge: true });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  }

  // Get data from Firestore
  private async getFirestoreData(query: string): Promise<GroceryProduct[] | null> {
    try {
      const searchRef = doc(this.db, 'grocery_searches', query.toLowerCase());
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

  // Get user's favorite grocery products
  async getFavoriteGroceryProducts(): Promise<string[]> {
    try {
      const user = this.auth.currentUser;
      if (!user) return [];

      const userRef = doc(this.db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.favoriteGroceryProducts || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting favorite grocery products:', error);
      return [];
    }
  }

  // Get mock grocery product data for testing
  private getMockGroceryProducts(query: string): GroceryProduct[] {
    // Format the query for better display
    const formattedQuery = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();

    return [
      // Blinkit products
      {
        name: `Organic ${formattedQuery}`,
        brand: 'Fresh Harvest',
        category: 'Organic Foods',
        description: `Premium quality organic ${query.toLowerCase()} sourced from certified farms.`,
        price: 199,
        sale_price: 179,
        market_price: 249,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},organic`,
        source: 'Blinkit',
        redirect: `https://blinkit.com/search?q=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 120,
          protein: 5,
          carbs: 22,
          fat: 1,
          fiber: 3,
          sugar: 2
        },
        offers: ['10% OFF', 'Buy 2 Get 1 Free'],
        rating: 4.5,
        reviews_count: 128,
        in_stock: true,
        delivery_time: '10-15 min',
        _collection: 'grocery'
      },
      {
        name: `${formattedQuery} Premium Pack`,
        brand: 'Blinkit Essentials',
        category: 'Packaged Foods',
        description: `High-quality ${query.toLowerCase()} packed with care for freshness.`,
        price: 149,
        sale_price: 129,
        market_price: 169,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},package`,
        source: 'Blinkit',
        redirect: `https://blinkit.com/search?q=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 110,
          protein: 4,
          carbs: 20,
          fat: 1,
          fiber: 2,
          sugar: 3
        },
        offers: ['₹20 OFF'],
        rating: 4.2,
        reviews_count: 86,
        in_stock: true,
        delivery_time: '10-15 min',
        _collection: 'grocery'
      },

      // Zepto products
      {
        name: `Fresh ${formattedQuery}`,
        brand: 'Zepto Fresh',
        category: 'Fresh Produce',
        description: `Farm-fresh ${query.toLowerCase()} delivered to your doorstep.`,
        price: 129,
        sale_price: 99,
        market_price: 149,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},fresh`,
        source: 'Zepto',
        redirect: `https://www.zeptonow.com/search?q=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 100,
          protein: 4,
          carbs: 18,
          fat: 0.5,
          fiber: 3,
          sugar: 2
        },
        offers: ['25% OFF', 'First Order Discount'],
        rating: 4.7,
        reviews_count: 203,
        in_stock: true,
        delivery_time: '10 min',
        _collection: 'grocery'
      },
      {
        name: `${formattedQuery} Value Pack`,
        brand: 'Zepto Select',
        category: 'Value Packs',
        description: `Economy pack of ${query.toLowerCase()} for your daily needs.`,
        price: 199,
        sale_price: 169,
        market_price: 229,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},bulk`,
        source: 'Zepto',
        redirect: `https://www.zeptonow.com/search?q=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 105,
          protein: 4.5,
          carbs: 19,
          fat: 0.6,
          fiber: 2.8,
          sugar: 2.2
        },
        offers: ['15% OFF'],
        rating: 4.3,
        reviews_count: 156,
        in_stock: true,
        delivery_time: '10 min',
        _collection: 'grocery'
      },

      // Instamart products
      {
        name: `Premium ${formattedQuery}`,
        brand: 'Swiggy Select',
        category: 'Premium Foods',
        description: `Top-quality ${query.toLowerCase()} for discerning customers.`,
        price: 249,
        sale_price: 219,
        market_price: 279,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},premium`,
        source: 'Instamart',
        redirect: `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 115,
          protein: 5.2,
          carbs: 21,
          fat: 0.8,
          fiber: 3.5,
          sugar: 1.8
        },
        offers: ['₹30 OFF', 'Free Delivery'],
        rating: 4.6,
        reviews_count: 178,
        in_stock: true,
        delivery_time: '15-20 min',
        _collection: 'grocery'
      },
      {
        name: `${formattedQuery} Family Pack`,
        brand: 'Instamart Essentials',
        category: 'Family Packs',
        description: `Large family pack of ${query.toLowerCase()} at great value.`,
        price: 299,
        sale_price: 259,
        market_price: 349,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},family`,
        source: 'Instamart',
        redirect: `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 112,
          protein: 4.8,
          carbs: 20.5,
          fat: 0.7,
          fiber: 3.2,
          sugar: 2.1
        },
        offers: ['₹40 OFF', '10% Cashback'],
        rating: 4.4,
        reviews_count: 142,
        in_stock: true,
        delivery_time: '15-20 min',
        _collection: 'grocery'
      },

      // BigBasket products
      {
        name: `Organic ${formattedQuery} Premium`,
        brand: 'BB Organic',
        category: 'Organic Foods',
        description: `Certified organic ${query.toLowerCase()} from trusted farms.`,
        price: 229,
        sale_price: 199,
        market_price: 259,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},organic,premium`,
        source: 'BigBasket',
        redirect: `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 118,
          protein: 5.5,
          carbs: 21.5,
          fat: 0.9,
          fiber: 3.8,
          sugar: 1.5
        },
        offers: ['13% OFF', 'BB Star Member Extra 5% OFF'],
        rating: 4.8,
        reviews_count: 215,
        in_stock: true,
        delivery_time: '60 min',
        _collection: 'grocery'
      },
      {
        name: `${formattedQuery} Economy Pack`,
        brand: 'BB Popular',
        category: 'Economy Packs',
        description: `Budget-friendly ${query.toLowerCase()} without compromising on quality.`,
        price: 159,
        sale_price: 139,
        market_price: 179,
        image_url: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(query)},economy`,
        source: 'BigBasket',
        redirect: `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`,
        nutritional_info: {
          calories: 108,
          protein: 4.2,
          carbs: 19.5,
          fat: 0.6,
          fiber: 2.9,
          sugar: 2.3
        },
        offers: ['₹20 OFF', 'Bank Offer 10% OFF'],
        rating: 4.1,
        reviews_count: 132,
        in_stock: true,
        delivery_time: '60 min',
        _collection: 'grocery'
      }
    ];
  }
}

export const groceryScrapingService = new GroceryScrapingService();
export default groceryScrapingService;
