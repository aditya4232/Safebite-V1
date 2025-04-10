const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const productSchema = new mongoose.Schema({}, { strict: false });
const grocerySchema = new mongoose.Schema({}, { strict: false });

// Define models
const Product = mongoose.model('Product', productSchema, 'products');
const GroceryProduct = mongoose.model('GroceryProduct', grocerySchema, 'Grocery Products');

// API Status endpoint
app.get('/status', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Get all products with pagination and search
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all grocery products with pagination and search
app.get('/api/groceryProducts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { ProductName: { $regex: search, $options: 'i' } },
          { Brand: { $regex: search, $options: 'i' } },
          { Category: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await GroceryProduct.countDocuments(query);
    const products = await GroceryProduct.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching grocery products:', error);
    res.status(500).json({ error: 'Failed to fetch grocery products' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get grocery product by ID
app.get('/api/groceryProducts/:id', async (req, res) => {
  try {
    const product = await GroceryProduct.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Grocery product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching grocery product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch grocery product' });
  }
});

// Legacy endpoints for backward compatibility
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find().limit(50).lean();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products (legacy):', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/grocery-products', async (req, res) => {
  try {
    const products = await GroceryProduct.find().limit(50).lean();
    res.json(products);
  } catch (error) {
    console.error('Error fetching grocery products (legacy):', error);
    res.status(500).json({ error: 'Failed to fetch grocery products' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API is available at http://localhost:${PORT}`);
});
