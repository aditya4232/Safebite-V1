// server/index.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safebite';
const DB_NAME = 'safebite';
let db;

// Root route for health check
app.get('/', (req, res) => {
  res.json({ status: 'API is running', version: '1.0.0' });
});

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Attempting to connect to MongoDB at:', MONGODB_URI);
    const client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    console.log('Connected to MongoDB successfully');
    db = client.db(DB_NAME);
    
    // Check if products collection exists and has data
    const collections = await db.listCollections().toArray();
    const hasProductsCollection = collections.some(c => c.name === 'products');
    
    if (hasProductsCollection) {
      const count = await db.collection('products').countDocuments();
      console.log(`Found ${count} documents in products collection`);
      
      // If collection exists but is empty, import data
      if (count === 0) {
        await importSampleData();
      }
    } else {
      // Create collection and import data
      console.log('Products collection not found, creating it...');
      await db.createCollection('products');
      await importSampleData();
    }
    
    // Create text index for better search if it doesn't exist
    try {
      await db.collection('products').createIndex({ 
        name: 'text', 
        'ingredients': 'text', 
        'category': 'text' 
      });
      console.log('Text index created or already exists');
    } catch (error) {
      console.warn('Could not create text index:', error);
    }
    
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Import sample data from CSV or use hardcoded data
async function importSampleData() {
  try {
    const productsCollection = db.collection('products');
    let products = [];
    
    // Try to import from CSV if available
    const csvFilePath = path.join(__dirname, '../Dataset-food&recipes/UK_fct.csv');
    
    if (fs.existsSync(csvFilePath)) {
      console.log('Importing data from CSV file:', csvFilePath);
      const jsonArray = await csv().fromFile(csvFilePath);
      
      products = jsonArray.map((item, index) => {
        // Extract nutrients and convert to numbers
        const calories = parseFloat(item.calories || '0');
        const protein = parseFloat(item.protein || '0');
        const carbs = parseFloat(item.carbs || '0');
        const fat = parseFloat(item.fat || '0');
        const fiber = item.fiber ? parseFloat(item.fiber) : undefined;
        const sugar = item.sugar ? parseFloat(item.sugar) : undefined;
        const sodium = item.sodium ? parseFloat(item.sodium) : undefined;
        
        // Calculate nutrition score
        let nutritionScore = 'yellow';
        if (protein > 15 && (fiber || 0) > 3 && (sugar || 0) < 10) {
          nutritionScore = 'green';
        } else if (fat > 20 || (sugar || 0) > 15) {
          nutritionScore = 'red';
        }
        
        // Parse ingredients, allergens, and additives if available
        const ingredients = item.ingredients ? item.ingredients.split(',').map(i => i.trim()) : [];
        const allergens = item.allergens ? item.allergens.split(',').map(a => a.trim()) : [];
        const additives = item.additives ? item.additives.split(',').map(a => a.trim()) : [];
        
        return {
          name: item.name || `Food Item ${index}`,
          brand: item.brand || 'Generic',
          category: item.category || 'Uncategorized',
          calories,
          nutrients: {
            protein,
            carbs,
            fat,
            fiber,
            sugar
          },
          ingredients,
          allergens,
          additives,
          nutritionScore,
          image: item.image || `https://source.unsplash.com/random/100x100/?${encodeURIComponent(item.name || 'food')}`,
          source: 'CSV Import'
        };
      });
      
      console.log(`Parsed ${products.length} products from CSV`);
    } else {
      // Use sample data if CSV not available
      console.log('CSV file not found, using sample data');
      products = [
        {
          name: 'Apple',
          brand: 'Organic Farms',
          category: 'Fruits',
          calories: 95,
          nutrients: {
            protein: 0.5,
            carbs: 25,
            fat: 0.3,
            fiber: 4.4,
            sugar: 19
          },
          ingredients: ['Apple'],
          allergens: [],
          additives: [],
          nutritionScore: 'green',
          image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
        },
        {
          name: 'Chicken Breast',
          brand: 'Premium Poultry',
          category: 'Meat',
          calories: 165,
          nutrients: {
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0
          },
          ingredients: ['Chicken Breast'],
          allergens: [],
          additives: [],
          nutritionScore: 'green',
          image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
        },
        {
          name: 'Chocolate Chip Cookies',
          brand: 'Sweet Treats',
          category: 'Snacks',
          calories: 450,
          nutrients: {
            protein: 5,
            carbs: 63,
            fat: 21,
            fiber: 2,
            sugar: 35
          },
          ingredients: ['Flour', 'Sugar', 'Butter', 'Chocolate Chips', 'Eggs', 'Vanilla Extract', 'Baking Soda', 'Salt'],
          allergens: ['Gluten', 'Dairy', 'Eggs'],
          additives: [],
          nutritionScore: 'red',
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
        },
        {
          name: 'Greek Yogurt',
          brand: 'Healthy Dairy',
          category: 'Dairy',
          calories: 100,
          nutrients: {
            protein: 17,
            carbs: 6,
            fat: 0.4,
            fiber: 0,
            sugar: 6
          },
          ingredients: ['Milk', 'Live Active Cultures'],
          allergens: ['Milk'],
          additives: [],
          nutritionScore: 'green',
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
        },
        {
          name: 'Spinach',
          brand: 'Fresh Greens',
          category: 'Vegetables',
          calories: 23,
          nutrients: {
            protein: 2.9,
            carbs: 3.6,
            fat: 0.4,
            fiber: 2.2,
            sugar: 0.4
          },
          ingredients: ['Spinach'],
          allergens: [],
          additives: [],
          nutritionScore: 'green',
          image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
        }
      ];
    }
    
    if (products.length > 0) {
      // Insert products into MongoDB
      const result = await productsCollection.insertMany(products);
      console.log(`Successfully imported ${result.insertedCount} products to MongoDB`);
    } else {
      console.log('No products to import');
    }
  } catch (error) {
    console.error('Error importing sample data:', error);
    throw error;
  }
}

// API Routes

// Search products
app.get('/api/products/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const products = await db.collection('products').find({
      $or: [
        { $text: { $search: query } },
        { name: { $regex: query, $options: 'i' } },
        { 'ingredients': { $regex: query, $options: 'i' } },
        { 'category': { $regex: query, $options: 'i' } }
      ]
    }).limit(20).toArray();
    
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await db.collection('products').findOne({ _id: id });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get similar products
app.get('/api/products/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the product first to find its category
    const product = await db.collection('products').findOne({ _id: id });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Find similar products in the same category
    const similarProducts = await db.collection('products').find({
      category: product.category,
      _id: { $ne: id }
    }).limit(5).toArray();
    
    res.json(similarProducts);
  } catch (error) {
    console.error('Error getting similar products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
async function startServer() {
  let client;
  try {
    client = await connectToMongoDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
    
    // Handle shutdown
    process.on('SIGINT', async () => {
      if (client) {
        await client.close();
        console.log('MongoDB connection closed');
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

startServer();
