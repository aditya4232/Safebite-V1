// Backend API for scraping restaurant data
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { db } = require('../firebase-admin');

// Cache for storing scraped data
const cache = {
  data: {},
  timestamp: {}
};

// Cache expiry time (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000;

// Helper function to scrape Swiggy
async function scrapeSwiggy(foodItem, city) {
  try {
    const searchUrl = `https://www.swiggy.com/search?query=${encodeURIComponent(foodItem)}&location=${encodeURIComponent(city)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.swiggy.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    const $ = cheerio.load(response.data);
    const restaurants = [];

    // Extract restaurant data
    $('.restaurant-item').each((i, el) => {
      const restaurant = {
        restaurant: $(el).find('.restaurant-name').text().trim(),
        rating: $(el).find('.restaurant-rating').text().trim(),
        delivery_time: $(el).find('.delivery-time').text().trim(),
        price_range: $(el).find('.price-range').text().trim(),
        cuisine: $(el).find('.cuisine-list').text().trim(),
        address: $(el).find('.restaurant-address').text().trim(),
        popular_dishes: $(el).find('.popular-dishes').text().trim().split(',').map(dish => dish.trim()),
        image_url: $(el).find('.restaurant-image img').attr('src'),
        source: 'Swiggy',
        redirect: $(el).find('.restaurant-link').attr('href')
      };
      
      restaurants.push(restaurant);
    });

    return restaurants;
  } catch (error) {
    console.error('Error scraping Swiggy:', error);
    return [];
  }
}

// Helper function to scrape Zomato
async function scrapeZomato(foodItem, city) {
  try {
    const searchUrl = `https://www.zomato.com/search?q=${encodeURIComponent(foodItem)}&location=${encodeURIComponent(city)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.zomato.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    const $ = cheerio.load(response.data);
    const restaurants = [];

    // Extract restaurant data
    $('.search-result').each((i, el) => {
      const restaurant = {
        restaurant: $(el).find('.result-title').text().trim(),
        rating: $(el).find('.rating-value').text().trim(),
        delivery_time: $(el).find('.delivery-time').text().trim(),
        price_range: $(el).find('.price-range').text().trim(),
        cuisine: $(el).find('.cuisine-list').text().trim(),
        address: $(el).find('.restaurant-address').text().trim(),
        popular_dishes: $(el).find('.popular-dishes').text().trim().split(',').map(dish => dish.trim()),
        image_url: $(el).find('.restaurant-image img').attr('src'),
        source: 'Zomato',
        redirect: $(el).find('.result-link').attr('href')
      };
      
      restaurants.push(restaurant);
    });

    return restaurants;
  } catch (error) {
    console.error('Error scraping Zomato:', error);
    return [];
  }
}

// Mock data for testing
function getMockData(foodItem) {
  return [
    {
      restaurant: `Hyderabad Panner butter masala House`,
      rating: '4.2',
      delivery_time: '30-35 min',
      price_range: '₹₹',
      cuisine: 'Various',
      address: 'Road No. 12, Hyderabad Central',
      popular_dishes: ['Panner butter masala Special', 'Spicy Panner butter masala'],
      source: 'Swiggy',
      redirect: 'https://www.swiggy.com',
      dish_details: [
        {
          name: 'Panner butter masala Special',
          price: '₹250',
          description: 'Delicious paneer in a rich buttery tomato sauce',
          is_veg: true,
          rating: '4.5'
        }
      ]
    },
    {
      restaurant: `Royal Panner butter masala`,
      rating: '4.3',
      delivery_time: '35-40 min',
      price_range: '₹₹₹',
      cuisine: 'Various',
      address: 'Banjara Hills, Hyderabad',
      popular_dishes: ['Spicy Panner butter masala', 'Classic Panner butter masala'],
      source: 'Zomato',
      redirect: 'https://www.zomato.com',
      dish_details: [
        {
          name: 'Classic Panner butter masala',
          price: '₹280',
          description: 'Traditional paneer butter masala with cream',
          is_veg: true,
          rating: '4.4'
        }
      ]
    },
    {
      restaurant: `The Panner butter masala Factory`,
      rating: '4',
      delivery_time: '25-30 min',
      price_range: '₹₹₹',
      cuisine: 'Various',
      address: 'Jubilee Hills, Hyderabad',
      popular_dishes: ['Panner butter masala Special', 'Kadai Panner butter masala'],
      source: 'Swiggy',
      redirect: 'https://www.swiggy.com',
      dish_details: [
        {
          name: 'Kadai Panner butter masala',
          price: '₹270',
          description: 'Spicy paneer with bell peppers and kadai masala',
          is_veg: true,
          rating: '4.2'
        }
      ]
    },
    {
      restaurant: `Hyderabad Panner butter masala Center`,
      rating: '4.1',
      delivery_time: '30-35 min',
      price_range: '₹₹',
      cuisine: 'Various',
      address: 'Madhapur, Hyderabad',
      popular_dishes: ['Panner butter masala Special', 'Butter Naan'],
      source: 'Zomato',
      redirect: 'https://www.zomato.com',
      dish_details: [
        {
          name: 'Butter Naan',
          price: '₹50',
          description: 'Soft buttery naan bread',
          is_veg: true,
          rating: '4.3'
        }
      ]
    }
  ];
}

// Route to scrape restaurant data
router.post('/restaurants', async (req, res) => {
  try {
    const { foodItem, city } = req.body;
    
    if (!foodItem || !city) {
      return res.status(400).json({ error: 'Food item and city are required' });
    }
    
    const cacheKey = `${foodItem}_${city}`;
    
    // Check if we have cached data that's not expired
    if (cache.data[cacheKey] && (Date.now() - cache.timestamp[cacheKey] < CACHE_EXPIRY)) {
      console.log('Returning cached data');
      return res.json(cache.data[cacheKey]);
    }
    
    // Check if we have data in Firestore
    const firestoreRef = db.collection('restaurant_searches').doc(cacheKey);
    const firestoreDoc = await firestoreRef.get();
    
    if (firestoreDoc.exists) {
      const firestoreData = firestoreDoc.data();
      
      // Check if Firestore data is not expired
      if (firestoreData.timestamp && (Date.now() - firestoreData.timestamp.toMillis() < CACHE_EXPIRY)) {
        console.log('Returning Firestore data');
        
        // Update cache
        cache.data[cacheKey] = firestoreData.results;
        cache.timestamp[cacheKey] = Date.now();
        
        // Update search count
        await firestoreRef.update({
          searchCount: (firestoreData.searchCount || 0) + 1,
          lastSearched: new Date()
        });
        
        return res.json(firestoreData.results);
      }
    }
    
    // If we get here, we need to scrape fresh data
    console.log('Scraping fresh data');
    
    // For now, return mock data instead of actual scraping
    // In a production environment, you would use the scrapeSwiggy and scrapeZomato functions
    // const swiggyResults = await scrapeSwiggy(foodItem, city);
    // const zomatoResults = await scrapeZomato(foodItem, city);
    // const combinedResults = [...swiggyResults, ...zomatoResults];
    
    const mockResults = getMockData(foodItem);
    
    // Save to Firestore
    await firestoreRef.set({
      foodItem,
      city,
      results: mockResults,
      timestamp: new Date(),
      searchCount: 1
    });
    
    // Update cache
    cache.data[cacheKey] = mockResults;
    cache.timestamp[cacheKey] = Date.now();
    
    res.json(mockResults);
  } catch (error) {
    console.error('Error scraping restaurants:', error);
    res.status(500).json({ error: 'Failed to scrape restaurant data' });
  }
});

module.exports = router;
