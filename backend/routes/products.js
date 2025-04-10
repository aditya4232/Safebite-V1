const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all products with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};

    // If search parameter is provided, use text search
    if (search) {
      query = { $text: { $search: search } };
    }

    // If category is provided, filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Count total products matching the query
    const total = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ healthScore: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.json({
      products,
      total,
      page,
      totalPages,
      limit
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search products endpoint (for compatibility with frontend)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query || '';
    const limit = parseInt(req.query.limit) || 20;

    // If the collection doesn't have the expected schema, use a more flexible approach
    const rawCollection = mongoose.connection.db.collection('products');

    // First try with the model
    let products = [];
    try {
      products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(limit);
    } catch (modelError) {
      console.warn('Error using Product model, falling back to raw collection:', modelError);

      // Fallback to raw collection query
      products = await rawCollection.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(limit).toArray();
    }

    res.json({
      products,
      total: products.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
