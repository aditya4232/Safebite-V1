# SafeBite Backend API

This is the backend API for the SafeBite application, providing endpoints for products and grocery products.

## Flask Backend (New)

A new Flask backend has been added to provide direct access to the MongoDB Atlas database. This backend is simpler and more efficient for direct MongoDB queries.

## API Endpoints

### Node.js Backend
- `GET /status` - Check API status
- `GET /api/products` - Get all products with pagination and search
- `GET /api/products/:id` - Get product by ID
- `GET /api/groceryProducts` - Get all grocery products with pagination and search
- `GET /api/groceryProducts/:id` - Get grocery product by ID

### Flask Backend
- `GET /` - API information and available endpoints
- `GET /search?q=<query>` - Search for food items by name (e.g., `/search?q=apple`)
- `GET /product/<product_id>` - Get detailed information about a specific product
- `GET /status` - Check API and database status

## Local Development

### Node.js Backend

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

### Flask Backend

1. Install Python dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Run the Flask application:
   ```
   python app.py
   ```

3. Access the API at `http://localhost:5000`

## Deployment on Render

### Node.js Backend

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

### Flask Backend

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: safebite-flask-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
   - **Environment Variables**:
     - `MONGODB_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite`

4. Click "Create Web Service"

5. Access the API at `https://safebite-flask-backend.onrender.com`

## MongoDB Atlas Connection

### Node.js Backend

The Node.js backend connects to MongoDB Atlas using the connection string provided in the `MONGODB_URI` environment variable. This connection is established in the `server.js` file:

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

### Flask Backend

The Flask backend connects directly to MongoDB Atlas using the PyMongo library. This connection is established in the `app.py` file:

```python
# MongoDB Atlas URI
mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/"
client = MongoClient(mongo_uri)
db = client["safebite"]  # Database name
collection = db["Grocery Products"]  # Collection name
```

## Models

The API uses two main models:

1. **Product** - For regular product items
2. **GroceryProduct** - For grocery store items

Both models include fields for nutritional information, allergens, dietary information, and more.

## Search Functionality

The API supports text search across multiple fields including name, brand, description, category, and tags. This is implemented using MongoDB's text indexes.
