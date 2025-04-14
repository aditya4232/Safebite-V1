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
    
    # Get collections
    grocery_collection = db["Grocery Products"]
    products_collection = db["products"]
    
    # Count documents
    grocery_count = grocery_collection.count_documents({})
    products_count = products_collection.count_documents({})
    logger.info(f"Found {grocery_count} grocery products and {products_count} products")
    
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
            "products": "/products",
            "grocery": "/grocery-products",
            "search": "/search?q=your_query"
        }
    })

# Products endpoint
@app.route("/products", methods=["GET"])
def get_products():
    """Get products with optional search"""
    logger.info("Products endpoint called")
    try:
        query = request.args.get("q", "")
        limit = int(request.args.get("limit", 20))
        
        if query:
            logger.info(f"Searching products for: {query}")
            try:
                # Use Atlas Search with wildcard path
                pipeline = [
                    {
                        "$search": {
                            "index": "default-products",
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
                
                results = list(products_collection.aggregate(pipeline))
                logger.info(f"Found {len(results)} products with Atlas Search")
                
                # If no results, fall back to regex search
                if not results:
                    logger.info("No Atlas Search results, falling back to regex search")
                    results = list(products_collection.find(
                        {"$or": [
                            {"recipe_name": {"$regex": query, "$options": "i"}},
                            {"food_name": {"$regex": query, "$options": "i"}}
                        ]}
                    ).limit(limit))
                    logger.info(f"Found {len(results)} products with regex search")
            except Exception as e:
                logger.error(f"Atlas Search error: {e}, falling back to regex search")
                results = list(products_collection.find(
                    {"$or": [
                        {"recipe_name": {"$regex": query, "$options": "i"}},
                        {"food_name": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(limit))
        else:
            logger.info(f"Getting all products (limit: {limit})")
            results = list(products_collection.find().limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
        
        logger.info(f"Returning {len(results)} products")
        return jsonify({
            "results": results,
            "count": len(results)
        })
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Grocery products endpoint
@app.route("/grocery-products", methods=["GET"])
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
def search():
    """Search across all collections"""
    logger.info("Search endpoint called")
    try:
        query = request.args.get("q", "")
        limit = int(request.args.get("limit", 20))
        
        if not query:
            return jsonify({"error": "Query parameter (q) is required"}), 400
        
        logger.info(f"Searching for: {query}")
        
        # Search in products collection with Atlas Search
        try:
            # Use Atlas Search with wildcard path
            pipeline = [
                {
                    "$search": {
                        "index": "default-products",
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
                {"$limit": limit // 2}
            ]
            
            product_results = list(products_collection.aggregate(pipeline))
            logger.info(f"Found {len(product_results)} product results with Atlas Search")
        except Exception as e:
            logger.error(f"Atlas Search error on products: {e}, falling back to regex")
            product_results = list(products_collection.find(
                {"$or": [
                    {"recipe_name": {"$regex": query, "$options": "i"}},
                    {"food_name": {"$regex": query, "$options": "i"}}
                ]}
            ).limit(limit // 2))
        
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
                {"$limit": limit // 2}
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
            ).limit(limit // 2))
        
        # Convert ObjectId to string for JSON serialization
        for result in product_results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "products"
        
        for result in grocery_results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
                result["_collection"] = "grocery"
        
        # Combine results
        all_results = product_results + grocery_results
        
        logger.info(f"Returning {len(all_results)} search results")
        return jsonify({
            "results": all_results,
            "count": len(all_results)
        })
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

if __name__ == "__main__":
    # Run the app
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port)
