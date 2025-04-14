# Quick Deployment Guide for Render

## 1. Update Your Render Service

1. Log in to your Render dashboard at https://dashboard.render.com/
2. Go to your existing `safebite-backend` service
3. Click on "Settings"
4. Update the following settings:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
5. Scroll down to the "Environment" section
6. Make sure you have these environment variables:
   - `PORT`: `10000`
   - `MONGO_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite`
   - `DEBUG`: `False`
7. Click "Save Changes"

## 2. Manual Deploy

1. After saving the changes, go back to the "Overview" tab
2. Click on "Manual Deploy" and select "Deploy latest commit"
3. Wait for the deployment to complete (this may take a few minutes)

## 3. Test the Deployment

Test the following endpoints to ensure everything is working correctly:

1. Root endpoint: `https://safebite-backend.onrender.com/`
2. Status endpoint: `https://safebite-backend.onrender.com/api/status`
3. Search endpoint: `https://safebite-backend.onrender.com/api/search?q=apple`
4. Products endpoint: `https://safebite-backend.onrender.com/api/products`
5. Grocery Products endpoint: `https://safebite-backend.onrender.com/api/grocery-products`

## 4. Check Logs

If you encounter any issues:
1. Go to the "Logs" tab in your Render dashboard
2. Check for any error messages
3. Make sure the server is starting correctly
4. Verify that the MongoDB connection is working

## 5. Restart if Needed

If you still have issues after deploying:
1. Go to the "Overview" tab
2. Click on "Restart" to restart the service
3. Wait for the service to restart and check the logs again
