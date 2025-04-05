# SafeBite Backend API

This is the backend API for the SafeBite application, designed to be deployed on Render.

## Local Development

1. Install dependencies:
```
npm install
```

2. Create a `.env` file with:
```
PORT=10000
MONGODB_URI=your_mongodb_connection_string
```

3. Start the development server:
```
npm run dev
```

## Deployment to Render

### Option 1: Automatic Deployment with render.yaml

1. Push your code to GitHub
2. In Render dashboard, click "New" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and set up the service
5. You'll be prompted to enter your MongoDB URI during setup

### Option 2: Manual Deployment

1. In Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - Name: safebite-backend
   - Root Directory: server
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
4. Add environment variables:
   - PORT: 10000
   - MONGODB_URI: your_mongodb_connection_string
5. Click "Create Web Service"

## API Endpoints

- `GET /api/products/search?query=apple` - Search for products
- `GET /api/products/:id` - Get a specific product
- `GET /api/products/:id/similar` - Get similar products

## MongoDB Setup

The server will automatically:
1. Connect to your MongoDB database
2. Create a 'products' collection if it doesn't exist
3. Import sample data if the collection is empty
4. Create text indexes for better search performance
