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
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "methods": "*"}})

# Custom JSON encoder to handle ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

app.json_encoder = JSONEncoder

# MongoDB Atlas URI
mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"

# Connect to MongoDB
try:
    logger.info("Connecting to MongoDB...")
    client = MongoClient(mongo_uri)
    db = client.safebite
    grocery_collection = db["Grocery Products"]

    # Count documents to verify connection
    grocery_count = grocery_collection.count_documents({})
    logger.info(f"Connected to MongoDB: Found {grocery_count} grocery products")
    mongodb_connected = True
except Exception as e:
    logger.error(f"MongoDB connection error: {e}")
    mongodb_connected = False

# Root endpoint
@app.route("/")
@app.route("/api")
@app.route("/api/")
def home():
    return jsonify({
        "status": "API is running",
        "version": "1.0.0",
        "mongodb_connected": mongodb_connected,
        "grocery_products_count": grocery_count if mongodb_connected else 0
    })

# Status endpoint
@app.route("/status")
def status():
    return jsonify({
        "status": "API is running",
        "version": "1.0.0",
        "mongodb_connected": mongodb_connected,
        "grocery_products_count": grocery_count if mongodb_connected else 0
    })

# Grocery products endpoint - multiple routes for compatibility
@app.route("/grocery")
@app.route("/grocery-products")
@app.route("/api/grocery")
@app.route("/api/grocery-products")
def get_grocery_products():
    try:
        logger.info("Grocery products endpoint called")
        limit = int(request.args.get("limit", 20))
        page = int(request.args.get("page", 1))
        search = request.args.get("search", "")
        category = request.args.get("category", "")

        # Calculate skip value for pagination
        skip = (page - 1) * limit

        logger.info(f"Getting grocery products (page: {page}, limit: {limit}, search: {search}, category: {category})")

        # Build query
        query = {}

        # Add search filter if provided
        if search:
            query["$or"] = [
                {"product": {"$regex": search, "$options": "i"}},
                {"brand": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
                {"sub_category": {"$regex": search, "$options": "i"}},
                {"type": {"$regex": search, "$options": "i"}}
            ]

        # Add category filter if provided
        if category and category.lower() != "all":
            query["category"] = {"$regex": category, "$options": "i"}

        # Get total count for pagination
        total_count = grocery_collection.count_documents(query)

        # Get products with pagination and filters
        results = list(grocery_collection.find(query).skip(skip).limit(limit))

        # Convert ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "grocery"

        logger.info(f"Returning {len(results)} grocery products (total: {total_count})")
        return jsonify({
            "products": results,
            "results": results,  # For compatibility
            "total": total_count,
            "page": page,
            "totalPages": (total_count + limit - 1) // limit,
            "collection": "grocery"
        })
    except Exception as e:
        logger.error(f"Error fetching grocery products: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Search endpoint
@app.route("/search")
@app.route("/api/search")
@app.route("/api/dataset/search")
def search():
    try:
        query = request.args.get("q", "") or request.args.get("query", "")
        limit = int(request.args.get("limit", 20))

        if not query:
            return jsonify({"error": "Query parameter (q or query) is required"}), 400

        logger.info(f"Searching for: {query}")

        # Simple regex search
        search_query = {
            "$or": [
                {"product": {"$regex": query, "$options": "i"}},
                {"brand": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}},
                {"sub_category": {"$regex": query, "$options": "i"}},
                {"type": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}}
            ]
        }

        # Use regex search for simplicity and reliability
        results = list(grocery_collection.find(search_query).limit(limit))
        logger.info(f"Found {len(results)} results with regex search")

        # Convert ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "grocery"

            # Add name field for consistency if it doesn't exist
            if "name" not in result and "product" in result:
                result["name"] = result["product"]

        return jsonify({
            "results": results,
            "items": results,  # For compatibility
            "count": len(results),
            "query": query
        })
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Get product by ID
@app.route("/grocery/<product_id>")
@app.route("/api/grocery/<product_id>")
def get_product(product_id):
    try:
        logger.info(f"Getting grocery product with ID: {product_id}")

        # Try with ObjectId
        try:
            product = grocery_collection.find_one({"_id": ObjectId(product_id)})
        except:
            # If not a valid ObjectId, try as string
            product = grocery_collection.find_one({"_id": product_id})

        if product:
            # Convert ObjectId to string
            if "_id" in product and isinstance(product["_id"], ObjectId):
                product["_id"] = str(product["_id"])

            # Add collection info
            product["_collection"] = "grocery"

            # Add name field for consistency if it doesn't exist
            if "name" not in product and "product" in product:
                product["name"] = product["product"]

            return jsonify(product)
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching product by ID: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
