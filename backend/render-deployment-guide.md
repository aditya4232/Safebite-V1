# Deploying the SafeBite Backend to Render

This guide will walk you through the process of deploying the SafeBite Flask backend to Render.com.

## Prerequisites

1. A Render.com account
2. Your SafeBite GitHub repository
3. MongoDB Atlas account with the database set up

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository has the following files:
- `backend/app.py` - The Flask application
- `backend/requirements.txt` - Python dependencies
- `backend/.env` - Environment variables (optional, you can set these in Render)

### 2. Create a New Web Service on Render

1. Log in to your Render dashboard at https://dashboard.render.com/
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:
   - **Name**: safebite-backend
   - **Environment**: Python 3
   - **Region**: Choose a region close to your users (e.g., Singapore for Asia)
   - **Branch**: main (or your preferred branch)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`

### 3. Configure Environment Variables

1. Scroll down to the "Environment" section
2. Add the following environment variables:
   - `PORT`: `10000`
   - `MONGO_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite`
   - `DEBUG`: `False`

### 4. Deploy the Service

1. Click "Create Web Service"
2. Wait for the deployment to complete (this may take a few minutes)
3. Once deployed, you'll get a URL like `https://safebite-backend.onrender.com`

### 5. Update Frontend Configuration

Update your frontend code to use the new Render URL:

```typescript
// src/services/mongoDbService.ts
const API_BASE_URL = 'https://safebite-backend.onrender.com';
```

### 6. Test the Deployment

Test the following endpoints to ensure everything is working correctly:

1. Root endpoint: `https://safebite-backend.onrender.com/`
2. Status endpoint: `https://safebite-backend.onrender.com/api/status`
3. Search endpoint: `https://safebite-backend.onrender.com/api/search?q=apple`
4. Products endpoint: `https://safebite-backend.onrender.com/api/products`
5. Grocery Products endpoint: `https://safebite-backend.onrender.com/api/grocery-products`

## Troubleshooting

### CORS Issues

If you encounter CORS issues, make sure the CORS configuration in your Flask app is correctly set up to allow requests from your frontend domain.

### MongoDB Connection Issues

If the backend can't connect to MongoDB:
1. Check if your IP address is whitelisted in MongoDB Atlas
2. Verify the connection string in the environment variables
3. Check the logs in the Render dashboard for any error messages

### 404 Errors

If you're getting 404 errors:
1. Make sure you're using the correct endpoint paths
2. Check if the API prefix is correctly configured
3. Verify that the MongoDB collections exist and have data

## Monitoring and Logs

You can monitor your backend service and view logs in the Render dashboard:
1. Go to your Web Service in the Render dashboard
2. Click on "Logs" to view the application logs
3. Set up alerts for any issues or errors

## Scaling

If you need to scale your backend:
1. Go to your Web Service in the Render dashboard
2. Click on "Settings"
3. Adjust the instance type and number of instances as needed
