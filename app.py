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

# MongoDB Atlas connection (from Render Env Variable or fallback)
app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite")

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
