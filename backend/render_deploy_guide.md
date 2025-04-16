# Deploying the Grocery API to Render

This guide explains how to deploy the Grocery API to Render.

## Prerequisites

- A Render account
- MongoDB Atlas connection string

## Steps

1. **Create a new Web Service on Render**

   - Go to the Render dashboard
   - Click "New" and select "Web Service"
   - Connect your GitHub repository or use the "Deploy from existing repository" option

2. **Configure the Web Service**

   - Name: `safebite-grocery-api` (or your preferred name)
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python backend/grocery_api.py`
   - Select the appropriate plan (Free tier works for testing)

3. **Add Environment Variables**

   - Click on "Environment" tab
   - Add the following environment variables:
     - `PORT`: `10000`
     - `MONGODB_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite`

4. **Deploy**

   - Click "Create Web Service"
   - Wait for the deployment to complete

5. **Test the Deployment**

   - Once deployed, you can test the API using the provided URL
   - Run the test script: `python test_grocery_api.py https://your-render-url.onrender.com`

## Troubleshooting

- If you encounter CORS issues, make sure the CORS configuration in the code is correct
- If the MongoDB connection fails, check the connection string and make sure the IP is whitelisted in MongoDB Atlas
- Check the Render logs for any errors

## API Endpoints

- `/` - Root endpoint, returns API status
- `/grocery` or `/grocery-products` - Returns grocery products with pagination
- `/search?q=query` - Searches for grocery products
- `/grocery/{product_id}` - Returns a specific grocery product by ID
