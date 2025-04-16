# Simplified MongoDB Atlas Connection for Grocery Products

This is a simplified implementation of a Flask API that connects to MongoDB Atlas to retrieve grocery product data.

## Features

- Direct connection to MongoDB Atlas
- Grocery product listing with pagination and search
- Product details by ID
- Search functionality
- Simple error handling

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python grocery_app.py
   ```

3. Test the API:
   ```
   python test_grocery_app.py
   ```

## API Endpoints

- **Root**: `/` - Check API status and MongoDB connection
- **Grocery Products**: `/grocery` or `/api/grocery-products` - Get all grocery products with pagination and search
- **Product by ID**: `/grocery/{product_id}` - Get a specific product by ID
- **Search**: `/search?q={query}` - Search for products

## Query Parameters

- **page**: Page number for pagination (default: 1)
- **limit**: Number of items per page (default: 20)
- **search**: Search term for filtering products
- **category**: Filter products by category

## MongoDB Atlas Connection

The application connects directly to MongoDB Atlas using the following connection string:
```
mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/
```

The database name is `safebite` and the collection name is `Grocery Products`.

## Deployment

This application can be deployed to Render or any other platform that supports Python applications.

For Render deployment:
1. Create a new Web Service
2. Connect your repository
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `gunicorn grocery_app:app`
5. Add environment variables if needed

## Notes

- This is a simplified implementation that focuses only on grocery products
- All other functionality has been removed for clarity
- Error handling is basic but functional
