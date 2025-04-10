const mongoose = require('mongoose');

const groceryProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number
  },
  allergens: [{
    type: String,
    trim: true
  }],
  dietaryInfo: [{
    type: String,
    trim: true
  }],
  healthScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  imageUrl: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  store: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock'],
    default: 'in-stock'
  }
}, {
  timestamps: true
});

// Create text index for search functionality
groceryProductSchema.index({
  name: 'text',
  brand: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
  store: 'text'
});

const GroceryProduct = mongoose.model('GroceryProduct', groceryProductSchema);

module.exports = GroceryProduct;
