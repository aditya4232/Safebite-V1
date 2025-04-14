from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# MongoDB Atlas URI
mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"

# Connect to MongoDB
try:
    logger.info("Connecting to MongoDB...")
    client = MongoClient(mongo_uri)
    db = client.safebite
    products = db.products
    grocery = db["Grocery Products"]
    logger.info("MongoDB connection successful!")
except Exception as e:
    logger.error(f"MongoDB connection error: {e}")
    # Create dummy collections for testing
    class DummyCollection:
        def __init__(self):
            self.data = []
        
        def find(self, query=None, **kwargs):
            return self.data
        
        def find_one(self, query=None):
            return None if not self.data else self.data[0]
        
        def count_documents(self, query=None):
            return len(self.data)
    
    products = DummyCollection()
    grocery = DummyCollection()

# Root endpoint
@app.route("/")
def home():
    return jsonify({"status": "API is running", "version": "1.0.0"})

# Products endpoint
@app.route("/products")
@app.route("/api/products")
def get_products():
    try:
        limit = int(request.args.get("limit", 20))
        logger.info(f"Getting products (limit: {limit})")
        
        # Get products
        results = []
        for product in products.find().limit(limit):
            # Convert ObjectId to string
            product["_id"] = str(product["_id"])
            results.append(product)
        
        logger.info(f"Returning {len(results)} products")
        return jsonify({
            "products": results,
            "results": results,
            "total": len(results),
            "page": 1,
            "totalPages": 1
        })
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({"error": str(e)}), 500

# Grocery products endpoint
@app.route("/grocery-products")
@app.route("/api/grocery-products")
def get_grocery():
    try:
        limit = int(request.args.get("limit", 20))
        logger.info(f"Getting grocery products (limit: {limit})")
        
        # Get grocery products
        results = []
        for product in grocery.find().limit(limit):
            # Convert ObjectId to string
            product["_id"] = str(product["_id"])
            results.append(product)
        
        logger.info(f"Returning {len(results)} grocery products")
        return jsonify({
            "products": results,
            "results": results,
            "total": len(results),
            "page": 1,
            "totalPages": 1
        })
    except Exception as e:
        logger.error(f"Error fetching grocery products: {e}")
        return jsonify({"error": str(e)}), 500

# Search endpoint
@app.route("/search")
@app.route("/api/search")
def search():
    try:
        query = request.args.get("q", "")
        limit = int(request.args.get("limit", 20))
        
        if not query:
            return jsonify({"error": "Query parameter is required"}), 400
        
        logger.info(f"Searching for: {query}")
        
        # Simple regex search in products
        product_results = []
        for product in products.find({"name": {"$regex": query, "$options": "i"}}).limit(limit//2):
            product["_id"] = str(product["_id"])
            product["_collection"] = "products"
            product_results.append(product)
        
        # Simple regex search in grocery
        grocery_results = []
        for product in grocery.find({"product": {"$regex": query, "$options": "i"}}).limit(limit//2):
            product["_id"] = str(product["_id"])
            product["_collection"] = "grocery"
            grocery_results.append(product)
        
        # Combine results
        all_results = product_results + grocery_results
        
        logger.info(f"Found {len(all_results)} results")
        return jsonify({
            "results": all_results,
            "items": all_results,
            "count": len(all_results)
        })
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
