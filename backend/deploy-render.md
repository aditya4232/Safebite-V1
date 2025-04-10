# Deploying to Render

Follow these steps to deploy the SafeBite backend to Render:

## 1. Create a Render Account

If you don't already have one, sign up for a Render account at https://render.com.

## 2. Create a New Web Service

1. Log in to your Render dashboard
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository or use the "Deploy from Git Repository" option

## 3. Configure the Web Service

Fill in the following details:

- **Name**: safebite-backend
- **Environment**: Node
- **Region**: Choose the region closest to your users
- **Branch**: main (or your preferred branch)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

## 4. Add Environment Variables

Add the following environment variables:

- `MONGODB_URI`: `mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite`
- `NODE_ENV`: `production`

## 5. Create the Web Service

Click "Create Web Service" to deploy your backend.

## 6. Seed the Database (Optional)

If you want to seed the database with sample data, you can:

1. Go to the "Shell" tab in your Render dashboard
2. Run the command: `node seed.js`

## 7. Update Frontend Configuration

Update your frontend code to use the new Render URL:

```typescript
// API base URL
export const API_BASE_URL = 'https://your-render-service-name.onrender.com';
```

Replace `your-render-service-name` with the actual name of your Render service.

## 8. Test the API

Once deployed, you can test the API by visiting:

- `https://your-render-service-name.onrender.com/status`

You should see a response like:

```json
{
  "status": "API is running",
  "version": "1.0.0"
}
```

## Troubleshooting

If you encounter any issues:

1. Check the Render logs in the "Logs" tab
2. Verify your MongoDB connection string is correct
3. Make sure your environment variables are set correctly
4. Check that your MongoDB Atlas IP access list includes Render's IPs (or is set to allow access from anywhere for testing)
