require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const GroceryProduct = require('./models/GroceryProduct');

// Sample products data
const productsData = [
  {
    name: 'Organic Greek Yogurt',
    brand: 'HealthyChoice',
    category: 'dairy',
    description: 'High-protein, probiotic-rich Greek yogurt made from organic milk.',
    ingredients: ['Organic Milk', 'Live Active Cultures'],
    nutritionalInfo: {
      calories: 120,
      protein: 15,
      carbs: 7,
      fat: 5,
      fiber: 0,
      sugar: 5
    },
    allergens: ['Milk'],
    dietaryInfo: ['High Protein', 'Gluten Free', 'Probiotic'],
    healthScore: 8.5,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['breakfast', 'snack', 'protein']
  },
  {
    name: 'Quinoa & Vegetable Bowl',
    brand: 'MealPrep',
    category: 'grains',
    description: 'Ready-to-eat bowl with quinoa, roasted vegetables, and tahini dressing.',
    ingredients: ['Quinoa', 'Bell Peppers', 'Zucchini', 'Chickpeas', 'Tahini', 'Olive Oil', 'Lemon Juice', 'Spices'],
    nutritionalInfo: {
      calories: 350,
      protein: 12,
      carbs: 45,
      fat: 14,
      fiber: 8,
      sugar: 4
    },
    allergens: ['Sesame'],
    dietaryInfo: ['Vegan', 'Gluten Free', 'High Fiber'],
    healthScore: 9.2,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['lunch', 'dinner', 'plant-based']
  },
  {
    name: 'Almond Butter',
    brand: 'NutWorks',
    category: 'protein',
    description: 'Stone-ground almond butter with no added sugar or oils.',
    ingredients: ['Almonds'],
    nutritionalInfo: {
      calories: 190,
      protein: 7,
      carbs: 6,
      fat: 17,
      fiber: 3,
      sugar: 1
    },
    allergens: ['Tree Nuts'],
    dietaryInfo: ['Keto', 'Paleo', 'Vegan'],
    healthScore: 7.8,
    imageUrl: 'https://images.unsplash.com/photo-1501012259-39cd25f3eda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['spread', 'snack', 'breakfast']
  },
  {
    name: 'Mixed Berry Smoothie',
    brand: 'FruitFusion',
    category: 'beverages',
    description: 'Ready-to-drink smoothie with mixed berries, banana, and chia seeds.',
    ingredients: ['Strawberries', 'Blueberries', 'Banana', 'Chia Seeds', 'Almond Milk', 'Honey'],
    nutritionalInfo: {
      calories: 180,
      protein: 4,
      carbs: 35,
      fat: 3,
      fiber: 6,
      sugar: 22
    },
    allergens: ['Tree Nuts'],
    dietaryInfo: ['Gluten Free', 'Antioxidant Rich'],
    healthScore: 7.5,
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a90bb0ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['breakfast', 'snack', 'drink']
  },
  {
    name: 'Lentil Chips',
    brand: 'SnackSmart',
    category: 'snacks',
    description: 'Crunchy chips made from lentil flour with sea salt.',
    ingredients: ['Lentil Flour', 'Sunflower Oil', 'Sea Salt'],
    nutritionalInfo: {
      calories: 130,
      protein: 5,
      carbs: 18,
      fat: 6,
      fiber: 3,
      sugar: 1
    },
    allergens: [],
    dietaryInfo: ['Gluten Free', 'Vegan', 'Non-GMO'],
    healthScore: 6.8,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['snack', 'chips', 'plant-based']
  },
  {
    name: 'Wild Salmon Fillet',
    brand: 'OceanFresh',
    category: 'protein',
    description: 'Sustainably caught wild salmon fillets, individually vacuum-sealed.',
    ingredients: ['Wild Salmon'],
    nutritionalInfo: {
      calories: 180,
      protein: 25,
      carbs: 0,
      fat: 9,
      fiber: 0,
      sugar: 0
    },
    allergens: ['Fish'],
    dietaryInfo: ['High Protein', 'Keto', 'Paleo', 'Omega-3 Rich'],
    healthScore: 9.5,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['dinner', 'seafood', 'protein']
  }
];

// Sample grocery products data
const groceryProductsData = [
  {
    name: 'Organic Spinach',
    brand: 'FreshGreens',
    category: 'fruits',
    description: 'Fresh organic spinach leaves, pre-washed and ready to eat.',
    ingredients: ['Organic Spinach'],
    nutritionalInfo: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4
    },
    allergens: [],
    dietaryInfo: ['Vegan', 'Gluten Free', 'Organic', 'Low Calorie'],
    healthScore: 9.8,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    price: 3.99,
    tags: ['vegetable', 'salad', 'organic'],
    store: 'Whole Foods',
    availability: 'in-stock'
  },
  {
    name: 'Grass-Fed Ground Beef',
    brand: 'PurePastures',
    category: 'protein',
    description: '100% grass-fed and finished ground beef, 85% lean.',
    ingredients: ['Grass-Fed Beef'],
    nutritionalInfo: {
      calories: 240,
      protein: 21,
      carbs: 0,
      fat: 17,
      fiber: 0,
      sugar: 0
    },
    allergens: [],
    dietaryInfo: ['High Protein', 'Keto', 'Paleo', 'Grass-Fed'],
    healthScore: 7.5,
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    price: 8.99,
    tags: ['meat', 'protein', 'grass-fed'],
    store: 'Trader Joe\'s',
    availability: 'in-stock'
  },
  {
    name: 'Organic Avocados',
    brand: 'NatureRipe',
    category: 'fruits',
    description: 'Organic Hass avocados, perfectly ripened and ready to eat.',
    ingredients: ['Organic Avocado'],
    nutritionalInfo: {
      calories: 240,
      protein: 3,
      carbs: 12,
      fat: 22,
      fiber: 10,
      sugar: 1
    },
    allergens: [],
    dietaryInfo: ['Vegan', 'Gluten Free', 'Organic', 'Healthy Fats'],
    healthScore: 9.0,
    imageUrl: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    price: 5.99,
    tags: ['fruit', 'healthy fats', 'organic'],
    store: 'Sprouts',
    availability: 'in-stock'
  },
  {
    name: 'Almond Milk',
    brand: 'NutMilk',
    category: 'beverages',
    description: 'Unsweetened almond milk with no added sugars or artificial ingredients.',
    ingredients: ['Filtered Water', 'Almonds', 'Calcium Carbonate', 'Sea Salt', 'Vitamin E', 'Vitamin D2'],
    nutritionalInfo: {
      calories: 30,
      protein: 1,
      carbs: 1,
      fat: 2.5,
      fiber: 0,
      sugar: 0
    },
    allergens: ['Tree Nuts'],
    dietaryInfo: ['Vegan', 'Gluten Free', 'Dairy Free', 'Unsweetened'],
    healthScore: 8.2,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    price: 3.49,
    tags: ['milk alternative', 'dairy free', 'beverage'],
    store: 'Whole Foods',
    availability: 'in-stock'
  }
];

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected for seeding');
  
  try {
    // Clear existing data
    await Product.deleteMany({});
    await GroceryProduct.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert new data
    await Product.insertMany(productsData);
    console.log(`Inserted ${productsData.length} products`);
    
    await GroceryProduct.insertMany(groceryProductsData);
    console.log(`Inserted ${groceryProductsData.length} grocery products`);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
