require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const productsRoutes = require('./routes/products');
const groceryProductsRoutes = require('./routes/groceryProducts');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/groceryProducts', groceryProductsRoutes);

// Direct routes for compatibility
app.use('/products', productsRoutes);
app.use('/grocery', groceryProductsRoutes);

// Status endpoint
app.get('/status', (req, res) => {
  res.json({ status: 'API is running', version: '1.0.0' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SafeBite API',
    endpoints: {
      status: '/status',
      products: '/api/products',
      productsSearch: '/api/products/search',
      groceryProducts: '/api/groceryProducts',
      directProducts: '/products',
      directGrocery: '/grocery'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
