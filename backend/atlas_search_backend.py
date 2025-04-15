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
CORS(app)

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
    products_collection = db.products
    grocery_collection = db["Grocery Products"]

    # Count documents to verify connection
    products_count = products_collection.count_documents({})
    grocery_count = grocery_collection.count_documents({})
    logger.info(f"Connected to MongoDB: Found {products_count} products and {grocery_count} grocery products")
    mongodb_connected = True
except Exception as e:
    logger.error(f"MongoDB connection error: {e}")
    mongodb_connected = False

# Root endpoint
@app.route("/")
@app.route("/api")
def home():
    return jsonify({
        "status": "API is running",
        "version": "1.0.0",
        "mongodb_connected": mongodb_connected
    })

# Products endpoint
@app.route("/products/")
@app.route("/products")
@app.route("/api/products/")
@app.route("/api/products")
@app.route("/dataset/products/")
@app.route("/dataset/products")
def get_products():
    try:
        logger.info("Products endpoint called")
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
            "total": products_count,
            "page": 1,
            "totalPages": (products_count + limit - 1) // limit,
            "collection": "products"
        })
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Grocery products endpoint
@app.route("/grocery-products/")
@app.route("/grocery-products")
@app.route("/api/grocery-products/")
@app.route("/api/grocery-products")
@app.route("/dataset/groceryProducts/")
@app.route("/dataset/groceryProducts")
@app.route("/grocery/")
@app.route("/grocery")
@app.route("/api/grocery/")
@app.route("/api/grocery")
@app.route("/dataset/grocery/")
@app.route("/dataset/grocery")
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

# Search endpoint using Atlas Search
@app.route("/search/")
@app.route("/search")
@app.route("/api/search/")
@app.route("/api/search")
@app.route("/api/dataset/search/")
@app.route("/api/dataset/search")
def search():
    try:
        # Support both 'q' and 'query' parameters for compatibility
        query = request.args.get("query", "") or request.args.get("q", "")
        limit = int(request.args.get("limit", 20))
        collection_filter = request.args.get("collection", "all").lower()  # Filter by collection

        if not query:
            return jsonify({"error": "Query parameter (query or q) is required"}), 400

        logger.info(f"Searching for: {query} in collection: {collection_filter}")

        product_results = []
        grocery_results = []

        # Search in products collection if requested
        if collection_filter in ["all", "products"]:
            try:
                # Use Atlas Search with wildcard path
                products_pipeline = [
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
                    {"$limit": limit if collection_filter == "products" else limit // 2}
                ]

                product_results = list(products_collection.aggregate(products_pipeline))
                logger.info(f"Found {len(product_results)} product results with Atlas Search")
            except Exception as e:
                logger.error(f"Atlas Search error on products: {e}, falling back to regex")
                # Fallback to regex search if Atlas Search fails
                product_results = list(products_collection.find(
                    {"$or": [
                        {"name": {"$regex": query, "$options": "i"}},
                        {"description": {"$regex": query, "$options": "i"}},
                        {"category": {"$regex": query, "$options": "i"}},
                        {"recipe_name": {"$regex": query, "$options": "i"}},
                        {"food_name": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(limit if collection_filter == "products" else limit // 2))
                logger.info(f"Found {len(product_results)} product results with regex search")

            # Add collection info to product results
            for result in product_results:
                if "_id" in result:
                    result["_id"] = str(result["_id"])
                    result["_collection"] = "products"

        # Search in grocery collection if requested
        if collection_filter in ["all", "grocery"]:
            try:
                # Use Atlas Search with wildcard path
                grocery_pipeline = [
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
                    {"$limit": limit if collection_filter == "grocery" else limit // 2}
                ]

                grocery_results = list(grocery_collection.aggregate(grocery_pipeline))
                logger.info(f"Found {len(grocery_results)} grocery results with Atlas Search")
            except Exception as e:
                logger.error(f"Atlas Search error on grocery: {e}, falling back to regex")
                # Fallback to regex search if Atlas Search fails
                grocery_results = list(grocery_collection.find(
                    {"$or": [
                        {"product": {"$regex": query, "$options": "i"}},
                        {"brand": {"$regex": query, "$options": "i"}},
                        {"category": {"$regex": query, "$options": "i"}},
                        {"sub_category": {"$regex": query, "$options": "i"}},
                        {"type": {"$regex": query, "$options": "i"}},
                        {"description": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(limit if collection_filter == "grocery" else limit // 2))
                logger.info(f"Found {len(grocery_results)} grocery results with regex search")

            # Add collection info to grocery results
            for result in grocery_results:
                if "_id" in result:
                    result["_id"] = str(result["_id"])
                    result["_collection"] = "grocery"

        # Combine results
        all_results = product_results + grocery_results

        logger.info(f"Returning {len(all_results)} search results")
        return jsonify({
            "results": all_results,
            "items": all_results,  # For compatibility with frontend
            "count": len(all_results),
            "query": query,
            "collection": collection_filter
        })
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

# Get product by ID
@app.route("/product/<product_id>/")
@app.route("/product/<product_id>")
@app.route("/api/product/<product_id>/")
@app.route("/api/product/<product_id>")
@app.route("/dataset/products/<product_id>/")
@app.route("/dataset/products/<product_id>")
@app.route("/grocery/<product_id>/")
@app.route("/grocery/<product_id>")
@app.route("/api/grocery/<product_id>/")
@app.route("/api/grocery/<product_id>")
@app.route("/dataset/grocery/<product_id>/")
@app.route("/dataset/grocery/<product_id>")
def get_product(product_id):
    try:
        logger.info(f"Getting product with ID: {product_id}")
        collection_hint = request.args.get("collection", "").lower()
        product = None

        # Try to find in the specified collection first if hint is provided
        if collection_hint == "grocery":
            # Try grocery collection first
            try:
                product = grocery_collection.find_one({"_id": ObjectId(product_id)})
            except:
                product = grocery_collection.find_one({"_id": product_id})

            # If not found, try products collection as fallback
            if not product:
                try:
                    product = products_collection.find_one({"_id": ObjectId(product_id)})
                except:
                    product = products_collection.find_one({"_id": product_id})
        else:
            # Default behavior: try products collection first
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

            # Determine which collection the product belongs to
            if collection_hint:
                # Use the hint if provided
                product["_collection"] = collection_hint
            else:
                # Try to determine collection based on fields
                if "product" in product:
                    product["_collection"] = "grocery"
                else:
                    product["_collection"] = "products"

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
