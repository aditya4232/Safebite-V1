const express = require('express');
const router = express.Router();
const GroceryProduct = require('../models/GroceryProduct');

// Get all grocery products with pagination and search
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

    // If store is provided, filter by store
    if (req.query.store) {
      query.store = req.query.store;
    }

    // Count total products matching the query
    const total = await GroceryProduct.countDocuments(query);

    // Get products with pagination
    const products = await GroceryProduct.find(query)
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
    console.error('Error fetching grocery products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search grocery products by name (simple search endpoint)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter (q) is required' });
    }

    // Use regex for case-insensitive search
    const products = await GroceryProduct.find({
      name: { $regex: query, $options: 'i' }
    }).limit(10);

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found matching your query' });
    }

    res.json(products);
  } catch (error) {
    console.error('Error searching grocery products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get grocery product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await GroceryProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Grocery product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching grocery product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
