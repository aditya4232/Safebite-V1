# SafeBite Backend API

This is the backend API for the SafeBite application, providing endpoints for products and grocery products.

## API Endpoints

- `GET /status` - Check API status
- `GET /api/products` - Get all products with pagination and search
- `GET /api/products/:id` - Get product by ID
- `GET /api/groceryProducts` - Get all grocery products with pagination and search
- `GET /api/groceryProducts/:id` - Get grocery product by ID

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Seed the database with sample data:
   ```
   node seed.js
   ```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: safebite-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     - `MONGODB_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite`

4. Click "Create Web Service"

## MongoDB Atlas Connection

The backend connects to MongoDB Atlas using the connection string provided in the `MONGODB_URI` environment variable. This connection is established in the `server.js` file:

```javascript
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
```

## Models

The API uses two main models:

1. **Product** - For regular product items
2. **GroceryProduct** - For grocery store items

Both models include fields for nutritional information, allergens, dietary information, and more.

## Search Functionality

The API supports text search across multiple fields including name, brand, description, category, and tags. This is implemented using MongoDB's text indexes.
