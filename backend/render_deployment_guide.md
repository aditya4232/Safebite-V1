# Deploying the Grocery API to Render

This guide explains how to deploy the Grocery API to Render.

## Prerequisites

- A Render account
- Access to the GitHub repository

## Steps

1. **Log in to Render**

   Go to [render.com](https://render.com/) and log in to your account.

2. **Create a New Web Service**

   - Click on "New" and select "Web Service"
   - Connect your GitHub repository or use the "Deploy from existing repository" option

3. **Configure the Web Service**

   - **Name**: `safebite-backend` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn grocery_api_simple:app`
   - **Plan**: Free

4. **Add Environment Variables**

   - Click on "Environment" tab
   - Add the following environment variables:
     - `MONGO_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/`
     - `PORT`: `10000`

5. **Deploy**

   - Click "Create Web Service"
   - Wait for the deployment to complete

6. **Test the API**

   Once deployed, you can test the API using the following endpoints:

   - `https://safebite-backend.onrender.com/` - Root endpoint
   - `https://safebite-backend.onrender.com/grocery` - Get grocery products
   - `https://safebite-backend.onrender.com/search?q=milk` - Search for products

## Troubleshooting

- If you encounter CORS issues, make sure the CORS configuration in the code is correct
- If the MongoDB connection fails, check the connection string and make sure the IP is whitelisted in MongoDB Atlas
- Check the Render logs for any errors
