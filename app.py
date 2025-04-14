from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
import os
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Custom JSON encoder to handle ObjectId
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

app.json_encoder = CustomJSONEncoder

# MongoDB Atlas connection (from Render Env Variable)
app.config["MONGO_URI"] = os.environ.get("MONGO_URI")

# Initialize PyMongo with error handling
try:
    mongo = PyMongo(app)
    logger.info("Successfully connected to MongoDB Atlas")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    # We'll continue and handle connection errors in each route

# Create text indexes for search functionality
# Flask 2.0+ doesn't support before_first_request, so we use a different approach
def create_indexes():
    try:
        # Check existing indexes for products collection
        existing_indexes = mongo.db.products.index_information()
        has_text_index = any("text" in str(idx.get("key", {})) for idx in existing_indexes.values())

        if has_text_index:
            logger.info("Text index already exists for products collection")
        else:
            try:
                # Try to create a text index if none exists
                mongo.db.products.create_index([
                    ("name", "text"),
                    ("recipe_name", "text"),
                    ("food_name", "text"),
                    ("category", "text"),
                    ("description", "text")
                ])
                logger.info("Created text index for products collection")
            except Exception as e:
                logger.warning(f"Could not create text index for products: {e}")

        # Check existing indexes for Grocery Products collection
        grocery_collection = mongo.db["Grocery Products"]
        existing_indexes = grocery_collection.index_information()
        has_text_index = any("text" in str(idx.get("key", {})) for idx in existing_indexes.values())

        if has_text_index:
            logger.info("Text index already exists for Grocery Products collection")
        else:
            try:
                # Try to create a text index if none exists
                grocery_collection.create_index([
                    ("product", "text"),
                    ("brand", "text"),
                    ("category", "text"),
                    ("description", "text")
                ])
                logger.info("Created text index for Grocery Products collection")
            except Exception as e:
                logger.warning(f"Could not create text index for Grocery Products: {e}")
    except Exception as e:
        logger.error(f"Error checking or creating indexes: {e}")
        # Continue even if index creation fails

# Create indexes when the app starts
try:
    with app.app_context():
        create_indexes()
        logger.info("MongoDB indexes created or verified")
except Exception as e:
    logger.error(f"Failed to create MongoDB indexes: {e}")

@app.route("/")
def home():
    return jsonify({"status": "API is running", "version": "1.0.0"})

@app.route("/status")
def status():
    return jsonify({"status": "API is running", "version": "1.0.0"})

# Fetch all items from 'products' collection with pagination and search
@app.route("/dataset/products")
def get_products():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        category = request.args.get('category', '')

        # Calculate skip value for pagination
        skip = (page - 1) * limit

        # Build query
        query = {}
        if search:
            query['$text'] = {'$search': search}
        if category and category != 'all':
            query['category'] = category

        logger.info(f"Products query: {query}, page: {page}, limit: {limit}")

        # Get total count
        total = mongo.db.products.count_documents(query)

        # Get products with pagination
        products = list(mongo.db.products.find(query).skip(skip).limit(limit))

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return jsonify({
            "products": products,
            "total": total,
            "page": page,
            "totalPages": total_pages,
            "limit": limit
        })
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({"error": str(e)}), 500

# Get product by ID
@app.route("/dataset/products/<id>")
def get_product(id):
    try:
        product = mongo.db.products.find_one({"_id": ObjectId(id)})
        if product:
            product['_id'] = str(product['_id'])
            return jsonify(product)
        return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching product by ID {id}: {e}")
        return jsonify({"error": str(e)}), 500

# Fetch all items from 'Grocery Products' collection with pagination and search
@app.route("/dataset/groceryProducts")
def get_grocery_products():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        category = request.args.get('category', '')

        # Calculate skip value for pagination
        skip = (page - 1) * limit

        # Build query
        query = {}
        if search:
            query['$text'] = {'$search': search}
        if category and category != 'all':
            query['category'] = category

        logger.info(f"Grocery Products query: {query}, page: {page}, limit: {limit}")

        # Get total count
        grocery_collection = mongo.db["Grocery Products"]  # Use quotes for space
        total = grocery_collection.count_documents(query)

        # Get products with pagination
        groceries = list(grocery_collection.find(query).skip(skip).limit(limit))

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return jsonify({
            "products": groceries,
            "total": total,
            "page": page,
            "totalPages": total_pages,
            "limit": limit
        })
    except Exception as e:
        logger.error(f"Error fetching grocery products: {e}")
        return jsonify({"error": str(e)}), 500

# Get grocery product by ID
@app.route("/dataset/groceryProducts/<id>")
def get_grocery_product(id):
    try:
        grocery_collection = mongo.db["Grocery Products"]
        product = grocery_collection.find_one({"_id": ObjectId(id)})
        if product:
            return jsonify(product)
        return jsonify({"error": "Grocery product not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching grocery product: {e}")
        return jsonify({"error": str(e)}), 500

# For backward compatibility
@app.route("/api/products")
def get_products_old():
    try:
        products = list(mongo.db.products.find().limit(100))
        return jsonify(products)
    except Exception as e:
        logger.error(f"Error fetching products (legacy): {e}")
        return jsonify({"error": str(e)}), 500

# For backward compatibility
@app.route("/api/grocery-products")
def get_grocery_products_old():
    try:
        grocery_collection = mongo.db["Grocery Products"]  # Use quotes for space
        groceries = list(grocery_collection.find().limit(100))
        return jsonify(groceries)
    except Exception as e:
        logger.error(f"Error fetching grocery products (legacy): {e}")
        return jsonify({"error": str(e)}), 500

# Community messages API
@app.route("/api/messages", methods=["GET"])
def get_messages():
    try:
        # Get messages from MongoDB
        messages = list(mongo.db.messages.find().sort("timestamp", -1).limit(100))
        return jsonify(messages)
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        return jsonify({"error": str(e)}), 500

# Add a new message
@app.route("/api/messages", methods=["POST"])
def add_message():
    try:
        # Get message data from request
        message_data = request.json

        # Validate message data
        if not message_data or not message_data.get("text") or not message_data.get("user"):
            return jsonify({"error": "Invalid message data"}), 400

        # Add timestamp if not provided
        if "timestamp" not in message_data:
            from datetime import datetime, timezone
            message_data["timestamp"] = datetime.now(timezone.utc)

        # Insert message into MongoDB
        result = mongo.db.messages.insert_one(message_data)

        # Return the inserted message
        return jsonify({
            "_id": str(result.inserted_id),
            **message_data
        }), 201
    except Exception as e:
        logger.error(f"Error adding message: {e}")
        return jsonify({"error": str(e)}), 500

# Food search API using MongoDB
@app.route("/api/food/search", methods=["GET"])
def search_food():
    try:
        query = request.args.get("query", "")
        if not query:
            return jsonify({"error": "Query parameter is required"}), 400

        # Search in MongoDB first
        results = list(mongo.db.products.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(20))

        # If no results from MongoDB, search in Grocery Products
        if not results:
            results = list(mongo.db["Grocery Products"].find(
                {"$text": {"$search": query}},
                {"score": {"$meta": "textScore"}}
            ).sort([("score", {"$meta": "textScore"})]).limit(20))

        return jsonify({
            "items": results,
            "query": query,
            "count": len(results)
        })
    except Exception as e:
        logger.error(f"Error searching food: {e}")
        return jsonify({"error": str(e)}), 500

# Food search API using MongoDB
@app.route("/api/dataset/search", methods=["GET"])
def search_dataset():
    try:
        query = request.args.get("query", "")
        if not query:
            return jsonify({"error": "Query parameter is required"}), 400

        # Try different search approaches
        # 1. First try text search in products collection
        try:
            results = list(mongo.db.products.find(
                {"$text": {"$search": query}},
                {"score": {"$meta": "textScore"}}
            ).sort([("score", {"$meta": "textScore"})]).limit(20))
        except Exception as e:
            logger.warning(f"Text search in products failed: {e}")
            # Fallback to regex search if text index doesn't exist
            results = list(mongo.db.products.find(
                {"name": {"$regex": query, "$options": "i"}}
            ).limit(20))

        # If no results from products, search in Grocery Products
        if not results:
            try:
                # Try text search first
                results = list(mongo.db["Grocery Products"].find(
                    {"$text": {"$search": query}},
                    {"score": {"$meta": "textScore"}}
                ).sort([("score", {"$meta": "textScore"})]).limit(20))
            except Exception as e:
                logger.warning(f"Text search in Grocery Products failed: {e}")
                # Fallback to regex search
                results = list(mongo.db["Grocery Products"].find(
                    {"$or": [
                        {"name": {"$regex": query, "$options": "i"}},
                        {"description": {"$regex": query, "$options": "i"}},
                        {"category": {"$regex": query, "$options": "i"}},
                        {"brand": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(20))

        return jsonify({
            "items": results,
            "query": query,
            "count": len(results)
        })
    except Exception as e:
        logger.error(f"Error searching food: {e}")
        return jsonify({"error": str(e)}), 500


# Simple search endpoint for MongoDB Atlas integration
@app.route("/search")
def simple_search():
    try:
        query = request.args.get("q", "")
        if not query:
            return jsonify({"error": "Query parameter (q) is required"}), 400

        # Try Atlas Search with fuzzy matching first
        try:
            # Use Atlas Search aggregation pipeline with fuzzy matching
            pipeline = [
                {
                    "$search": {
                        "index": "default",
                        "compound": {
                            "should": [
                                {
                                    "text": {
                                        "query": query,
                                        "path": "name",
                                        "fuzzy": {
                                            "maxEdits": 2,
                                            "prefixLength": 0,
                                            "maxExpansions": 50
                                        },
                                        "score": { "boost": { "value": 5 } }
                                    }
                                },
                                {
                                    "text": {
                                        "query": query,
                                        "path": "description",
                                        "fuzzy": {
                                            "maxEdits": 1,
                                            "prefixLength": 0
                                        },
                                        "score": { "boost": { "value": 3 } }
                                    }
                                },
                                {
                                    "text": {
                                        "query": query,
                                        "path": ["category", "brand"],
                                        "fuzzy": {
                                            "maxEdits": 1
                                        },
                                        "score": { "boost": { "value": 2 } }
                                    }
                                }
                            ]
                        }
                    }
                },
                # Add a sort by score
                {"$sort": {"score": {"$meta": "searchScore"}}},
                # Limit to 10 results
                {"$limit": 10},
                # Add a project stage to include the search score
                {"$project": {
                    "_id": 1,
                    "name": 1,
                    "description": 1,
                    "brand": 1,
                    "category": 1,
                    "nutritionalInfo": 1,
                    "ingredients": 1,
                    "allergens": 1,
                    "imageUrl": 1,
                    "score": {"$meta": "searchScore"}
                }}
            ]

            # Execute the aggregation pipeline
            results = list(mongo.db["Grocery Products"].aggregate(pipeline))

            logger.info(f"Atlas Search found {len(results)} results for '{query}'")
        except Exception as e:
            # If Atlas Search fails, log the error and fall back to regex search
            logger.warning(f"Atlas Search failed: {e}")
            results = []

        # If Atlas Search didn't work or found no results, fall back to regex search
        if not results:
            # 1. First try exact name match (case-insensitive)
            results = list(mongo.db["Grocery Products"].find(
                {"name": {"$regex": f"^{query}$", "$options": "i"}}
            ).limit(10))

            # 2. If no results, try contains search
            if not results:
                results = list(mongo.db["Grocery Products"].find(
                    {"name": {"$regex": query, "$options": "i"}}
                ).limit(10))

            # 3. If still no results, try searching in other fields
            if not results:
                results = list(mongo.db["Grocery Products"].find(
                    {"$or": [
                        {"name": {"$regex": query, "$options": "i"}},
                        {"description": {"$regex": query, "$options": "i"}},
                        {"category": {"$regex": query, "$options": "i"}},
                        {"brand": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(10))

        # Convert ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])

        if results:
            return jsonify(results)
        else:
            return jsonify({"message": "No products found matching your query"}), 404
    except Exception as e:
        logger.error(f"Error in simple search: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Product endpoint for MongoDB Atlas integration
@app.route("/product/<product_id>")
def get_product_by_id(product_id):
    try:
        # Find product by ID
        result = mongo.db["Grocery Products"].find_one({"_id": ObjectId(product_id)})

        if result:
            # Convert ObjectId to string for JSON serialization
            result["_id"] = str(result["_id"])
            return jsonify(result)
        else:
            return jsonify({"message": "Product not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching product: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Status endpoint for MongoDB Atlas integration
@app.route("/status")
def check_status():
    try:
        # Check MongoDB connection
        db_status = "connected" if mongo.db.command('ping')["ok"] else "disconnected"

        # Count documents in collection
        doc_count = mongo.db["Grocery Products"].count_documents({})

        return jsonify({
            "api_status": "running",
            "version": "2.5.0",
            "database_status": db_status,
            "document_count": doc_count
        })
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        return jsonify({
            "api_status": "running",
            "version": "2.5.0",
            "database_status": "error",
            "error": str(e)
        }), 500

# Health check endpoint for MongoDB connection
@app.route("/api/health")
def health_check():
    try:
        # Check MongoDB connection
        mongo.db.command('ping')
        return jsonify({
            "status": "healthy",
            "mongodb": "connected",
            "version": "1.0.0"
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "mongodb": "disconnected",
            "error": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
