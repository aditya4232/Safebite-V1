from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB Atlas URI
mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"

# Initialize connection status
mongodb_connected = False

try:
    # Connect with a timeout
    logger.info("Connecting to MongoDB...")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)

    # Test connection
    client.admin.command('ping')
    logger.info("MongoDB connection successful!")

    # Get database
    db = client["safebite"]

    # Get collections - focusing only on Grocery Products
    grocery_collection = db["Grocery Products"]

    # Count documents
    grocery_count = grocery_collection.count_documents({})
    logger.info(f"Found {grocery_count} grocery products")

    mongodb_connected = True
except Exception as e:
    logger.error(f"MongoDB connection error: {e}")
    mongodb_connected = False

# Root endpoint
@app.route("/", methods=["GET"])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "message": "SafeBite API v2.5",
        "status": "running",
        "mongodb_connected": mongodb_connected,
        "endpoints": {
            "grocery": "/grocery-products",
            "search": "/search?q=your_query"
        }
    })

# Redirect old products endpoint to grocery products
@app.route("/products", methods=["GET"])
@app.route("/dataset/products", methods=["GET"])
def redirect_to_grocery():
    """Redirect old products endpoint to grocery products"""
    logger.info("Products endpoint called - redirecting to grocery products")
    return get_grocery_products()

# Grocery products endpoint
@app.route("/grocery-products", methods=["GET"])
@app.route("/dataset/groceryProducts", methods=["GET"])
def get_grocery_products():
    """Get grocery products with optional search"""
    logger.info("Grocery products endpoint called")
    try:
        query = request.args.get("q", "")
        limit = int(request.args.get("limit", 20))

        if query:
            logger.info(f"Searching grocery products for: {query}")
            try:
                # Use Atlas Search with wildcard path
                pipeline = [
                    {
                        "$search": {
                            "index": "default",
                            "text": {
                                "query": query,
                                "path": {
                                    "wildcard": "*"
                                },
                                "fuzzy": {
                                    "maxEdits": 2
                                }
                            }
                        }
                    },
                    # Limit results
                    {"$limit": limit}
                ]

                results = list(grocery_collection.aggregate(pipeline))
                logger.info(f"Found {len(results)} grocery products with Atlas Search")

                # If no results, fall back to regex search
                if not results:
                    logger.info("No Atlas Search results, falling back to regex search")
                    results = list(grocery_collection.find(
                        {"$or": [
                            {"product": {"$regex": query, "$options": "i"}},
                            {"brand": {"$regex": query, "$options": "i"}},
                            {"category": {"$regex": query, "$options": "i"}}
                        ]}
                    ).limit(limit))
                    logger.info(f"Found {len(results)} grocery products with regex search")
            except Exception as e:
                logger.error(f"Atlas Search error: {e}, falling back to regex search")
                results = list(grocery_collection.find(
                    {"$or": [
                        {"product": {"$regex": query, "$options": "i"}},
                        {"brand": {"$regex": query, "$options": "i"}},
                        {"category": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(limit))
        else:
            logger.info(f"Getting all grocery products (limit: {limit})")
            results = list(grocery_collection.find().limit(limit))

        # Convert ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])

        logger.info(f"Returning {len(results)} grocery products")
        return jsonify({
            "results": results,
            "count": len(results)
        })
    except Exception as e:
        logger.error(f"Error fetching grocery products: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Search endpoint
@app.route("/search", methods=["GET"])
@app.route("/api/dataset/search", methods=["GET"])
def search():
    """Search in grocery products collection"""
    logger.info("Search endpoint called")
    try:
        # Support both 'q' and 'query' parameters for compatibility
        query = request.args.get("query", "") or request.args.get("q", "")
        limit = int(request.args.get("limit", 20))

        if not query:
            return jsonify({"error": "Query parameter (query or q) is required"}), 400

        logger.info(f"Searching for: {query}")

        # Search in grocery collection with Atlas Search
        try:
            # Use Atlas Search with wildcard path
            pipeline = [
                {
                    "$search": {
                        "index": "default",
                        "text": {
                            "query": query,
                            "path": {
                                "wildcard": "*"
                            },
                            "fuzzy": {
                                "maxEdits": 2
                            }
                        }
                    }
                },
                # Limit results
                {"$limit": limit}
            ]

            grocery_results = list(grocery_collection.aggregate(pipeline))
            logger.info(f"Found {len(grocery_results)} grocery results with Atlas Search")
        except Exception as e:
            logger.error(f"Atlas Search error on grocery: {e}, falling back to regex")
            grocery_results = list(grocery_collection.find(
                {"$or": [
                    {"product": {"$regex": query, "$options": "i"}},
                    {"brand": {"$regex": query, "$options": "i"}},
                    {"category": {"$regex": query, "$options": "i"}}
                ]}
            ).limit(limit))

        # Convert ObjectId to string for JSON serialization
        for result in grocery_results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "grocery"

        logger.info(f"Returning {len(grocery_results)} search results")
        return jsonify({
            "results": grocery_results,
            "items": grocery_results,  # For compatibility with frontend
            "count": len(grocery_results)
        })
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Get product by ID
@app.route("/product/<id>", methods=["GET"])
@app.route("/dataset/products/<id>", methods=["GET"])
def get_product_by_id(id):
    """Get a grocery product by ID"""
    logger.info(f"Getting grocery product with ID: {id}")
    try:
        # Find in grocery collection
        product = grocery_collection.find_one({"_id": id})

        if product:
            # Add collection info
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
