const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB Atlas"));

// Define schema for 'Grocery Products'
const GrocerySchema = new mongoose.Schema({}, { collection: "Grocery Products" });
const Grocery = mongoose.model('Grocery', GrocerySchema);

// Define schema for 'products'
const ProductSchema = new mongoose.Schema({}, { collection: "products" });
const Product = mongoose.model('Product', ProductSchema);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'API is running', 
    version: '1.0.0',
    endpoints: [
      '/grocery',
      '/products'
    ]
  });
});

// Grocery Products endpoint
app.get('/grocery', async (req, res) => {
  try {
    const data = await Grocery.find().limit(20);
    res.json(data);
  } catch (err) {
    console.error('Error fetching grocery products:', err);
    res.status(500).json({ error: 'Failed to fetch grocery products' });
  }
});

// Products endpoint
app.get('/products', async (req, res) => {
  try {
    const data = await Product.find().limit(20);
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Search endpoint for grocery products
app.get('/grocery/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;
    
    const data = await Grocery.find({
      $or: [
        { ProductName: { $regex: query, $options: 'i' } },
        { Brand: { $regex: query, $options: 'i' } },
        { Category: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit);
    
    res.json(data);
  } catch (err) {
    console.error('Error searching grocery products:', err);
    res.status(500).json({ error: 'Failed to search grocery products' });
  }
});

// Search endpoint for products
app.get('/products/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;
    
    const data = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit);
    
    res.json(data);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
