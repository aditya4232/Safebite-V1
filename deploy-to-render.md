# Deploying to Render

Follow these steps to deploy your SafeBite backend to Render and connect it to your MongoDB Atlas database.

## Step 1: Push Your Code to GitHub

Make sure your code is pushed to a GitHub repository, including:
- The `server` directory
- The `render.yaml` file

## Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and log in
2. Click "New" and select "Blueprint"
3. Connect your GitHub repository
4. Render will detect the render.yaml file and set up the service
5. Review the settings and click "Apply"
6. Wait for the deployment to complete (this may take a few minutes)

## Step 3: Verify the Deployment

1. Once deployed, Render will provide you with a URL like:
   ```
   https://safebite-backend.onrender.com
   ```
2. Visit this URL in your browser - you should see a JSON response:
   ```json
   {"status":"API is running","version":"1.0.0"}
   ```
3. Test the API by visiting:
   ```
   https://safebite-backend.onrender.com/api/products/search?query=apple
   ```

## Step 4: Update Your Frontend

1. Update your frontend code to use the Render backend URL:

```javascript
// In src/services/apiService.ts
const API_BASE_URL = 'https://safebite-backend.onrender.com/api';
const USE_MOCK_DATA = false;
```

2. Deploy your frontend to GitHub Pages or another hosting service

## Troubleshooting

If you encounter any issues:

1. Check the Render logs for errors
2. Verify your MongoDB connection string is correct
3. Make sure your MongoDB Atlas network access allows connections from anywhere (IP: 0.0.0.0/0)
4. Test the connection locally before deploying

## MongoDB Atlas Database

Your MongoDB Atlas connection string is:
```
mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite?retryWrites=true&w=majority
```

This database is currently empty. The server will automatically:
1. Create a 'products' collection if it doesn't exist
2. Import sample data if the collection is empty
3. Create text indexes for better search performance
