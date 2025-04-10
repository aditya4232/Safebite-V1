# Checking Render Logs

To check the logs for your Render deployment, follow these steps:

1. Log in to your Render dashboard at https://dashboard.render.com/
2. Select your backend service (safebite-backend)
3. Click on the "Logs" tab
4. Check for any errors or issues in the logs

## Common Issues and Solutions

### 1. Missing Dependencies

If you see errors about missing dependencies, make sure your requirements.txt file includes all necessary packages:

```
Flask==2.2.3
Flask-PyMongo==2.3.0
Flask-Cors==3.0.10
pymongo==4.3.3
gunicorn==20.1.0
bson==0.5.10
python-dotenv==1.0.0
```

### 2. MongoDB Connection Issues

If you see errors about MongoDB connection, check:
- The MONGO_URI environment variable is set correctly in Render
- The MongoDB Atlas IP access list includes Render's IPs or is set to allow access from anywhere

### 3. Port Configuration

Make sure your app is configured to use the PORT environment variable:

```python
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
```

### 4. Procfile Issues

Make sure your Procfile is correctly configured:

```
web: gunicorn app:app
```

## Manual Deployment

If needed, you can manually deploy your app on Render:

1. Go to your service in the Render dashboard
2. Click on "Manual Deploy"
3. Select "Clear build cache & deploy"

This will force a fresh deployment of your application.
