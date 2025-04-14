from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Custom JSON encoder to handle ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

app.json_encoder = JSONEncoder

# MongoDB Atlas URI
mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"

# Initialize connection and collections
client = None
db = None
products_collection = None
grocery_collection = None
mongodb_connected = False

try:
    # Connect with a timeout
    logger.info("Connecting to MongoDB...")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    
    # Test connection
    client.admin.command('ping')
    
    # Get database and collections
    db = client.safebite
    products_collection = db.products
    grocery_collection = db["Grocery Products"]
    
    # Count documents to verify connection
    grocery_count = grocery_collection.count_documents({})
    products_count = products_collection.count_documents({})
    logger.info(f"Found {grocery_count} grocery products and {products_count} products")
    
    mongodb_connected = True
except Exception as e:
    logger.error(f"MongoDB connection error: {e}")
    mongodb_connected = False

# Root endpoint
@app.route("/", methods=["GET"])
@app.route("/api", methods=["GET"])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "status": "API is running",
        "version": "1.0.0",
        "mongodb_connected": mongodb_connected,
        "endpoints": {
            "products": "/products or /api/products",
            "grocery": "/grocery-products or /api/grocery-products",
            "search": "/search?q=your_query or /api/search?q=your_query"
        }
    })

# Products endpoint
@app.route("/products", methods=["GET"])
@app.route("/api/products", methods=["GET"])
@app.route("/dataset/products", methods=["GET"])
def get_products():
    """Get products with optional search"""
    logger.info("Products endpoint called")
    try:
        query = request.args.get("q", "") or request.args.get("search", "")
        limit = int(request.args.get("limit", 20))
        
        logger.info(f"Getting all products (limit: {limit})")
        
        # Get products with limit
        results = list(products_collection.find().limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "products"
        
        logger.info(f"Returning {len(results)} products")
        return jsonify({
            "products": results,
            "results": results,  # For compatibility
            "total": len(results),
            "page": 1,
            "totalPages": 1,
            "collection": "products"
        })
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Grocery products endpoint
@app.route("/grocery-products", methods=["GET"])
@app.route("/api/grocery-products", methods=["GET"])
@app.route("/dataset/groceryProducts", methods=["GET"])
def get_grocery_products():
    """Get grocery products with optional search"""
    logger.info("Grocery products endpoint called")
    try:
        query = request.args.get("q", "") or request.args.get("search", "")
        limit = int(request.args.get("limit", 20))
        
        logger.info(f"Getting all grocery products (limit: {limit})")
        
        # Get products with limit
        results = list(grocery_collection.find().limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "grocery"
        
        logger.info(f"Returning {len(results)} grocery products")
        return jsonify({
            "products": results,
            "results": results,  # For compatibility
            "total": len(results),
            "page": 1,
            "totalPages": 1,
            "collection": "grocery"
        })
    except Exception as e:
        logger.error(f"Error fetching grocery products: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Search endpoint
@app.route("/search", methods=["GET"])
@app.route("/api/search", methods=["GET"])
@app.route("/api/dataset/search", methods=["GET"])
def search():
    """Search across all collections"""
    logger.info("Search endpoint called")
    try:
        # Support both 'q' and 'query' parameters for compatibility
        query = request.args.get("query", "") or request.args.get("q", "")
        limit = int(request.args.get("limit", 20))
        
        if not query:
            return jsonify({"error": "Query parameter (query or q) is required"}), 400
        
        logger.info(f"Searching for: {query}")
        
        # Search in products collection with regex
        product_results = list(products_collection.find(
            {"$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]}
        ).limit(limit // 2))
        
        # Add collection info
        for result in product_results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "products"
        
        logger.info(f"Found {len(product_results)} product results with regex search")
        
        # Search in grocery collection with regex
        grocery_results = list(grocery_collection.find(
            {"$or": [
                {"product": {"$regex": query, "$options": "i"}},
                {"brand": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]}
        ).limit(limit // 2))
        
        # Add collection info
        for result in grocery_results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "grocery"
        
        logger.info(f"Found {len(grocery_results)} grocery results with regex search")
        
        # Combine results
        all_results = product_results + grocery_results
        
        logger.info(f"Returning {len(all_results)} search results")
        return jsonify({
            "results": all_results,
            "items": all_results,  # For compatibility with frontend
            "count": len(all_results)
        })
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Get product by ID
@app.route("/product/<product_id>", methods=["GET"])
@app.route("/api/product/<product_id>", methods=["GET"])
@app.route("/dataset/products/<product_id>", methods=["GET"])
def get_product(product_id):
    """Get a product by ID"""
    logger.info(f"Getting product with ID: {product_id}")
    try:
        # Try to find in products collection first
        product = None
        
        # Try with ObjectId
        try:
            product = products_collection.find_one({"_id": ObjectId(product_id)})
        except:
            # If not a valid ObjectId, try as string
            product = products_collection.find_one({"_id": product_id})
        
        # If not found, try in grocery collection
        if not product:
            try:
                product = grocery_collection.find_one({"_id": ObjectId(product_id)})
            except:
                product = grocery_collection.find_one({"_id": product_id})
        
        if product:
            # Convert ObjectId to string
            if "_id" in product and isinstance(product["_id"], ObjectId):
                product["_id"] = str(product["_id"])
            
            # Add collection info
            if product in products_collection.find():
                product["_collection"] = "products"
            else:
                product["_collection"] = "grocery"
            
            return jsonify(product)
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching product by ID: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

if __name__ == "__main__":
    # Run the app
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port)
