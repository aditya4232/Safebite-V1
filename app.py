from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
import os
import json

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
mongo = PyMongo(app)

@app.route("/")
def home():
    return jsonify({"status": "API is running", "version": "1.0.0"})

@app.route("/status")
def status():
    return jsonify({"status": "API is running", "version": "1.0.0"})

# Fetch all items from 'products' collection with pagination and search
@app.route("/api/products")
def get_products():
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

    # Get total count
    total = mongo.db.products.count_documents(query)

    # Get products with pagination
    products = mongo.db.products.find(query).skip(skip).limit(limit)

    # Format results
    result = []
    for item in products:
        item['_id'] = str(item['_id'])
        result.append(item)

    # Calculate total pages
    total_pages = (total + limit - 1) // limit

    return jsonify({
        "products": result,
        "total": total,
        "page": page,
        "totalPages": total_pages,
        "limit": limit
    })

# Get product by ID
@app.route("/api/products/<id>")
def get_product(id):
    try:
        product = mongo.db.products.find_one({"_id": ObjectId(id)})
        if product:
            product['_id'] = str(product['_id'])
            return jsonify(product)
        return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetch all items from 'Grocery Products' collection with pagination and search
@app.route("/api/groceryProducts")
def get_grocery_products():
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

    # Get total count
    grocery_collection = mongo.db["Grocery Products"]  # Use quotes for space
    total = grocery_collection.count_documents(query)

    # Get products with pagination
    groceries = grocery_collection.find(query).skip(skip).limit(limit)

    # Format results
    result = []
    for item in groceries:
        item['_id'] = str(item['_id'])
        result.append(item)

    # Calculate total pages
    total_pages = (total + limit - 1) // limit

    return jsonify({
        "products": result,
        "total": total,
        "page": page,
        "totalPages": total_pages,
        "limit": limit
    })

# Get grocery product by ID
@app.route("/api/groceryProducts/<id>")
def get_grocery_product(id):
    try:
        grocery_collection = mongo.db["Grocery Products"]
        product = grocery_collection.find_one({"_id": ObjectId(id)})
        if product:
            product['_id'] = str(product['_id'])
            return jsonify(product)
        return jsonify({"error": "Grocery product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# For backward compatibility
@app.route("/products")
def get_products_old():
    products = mongo.db.products.find()
    result = []
    for item in products:
        item['_id'] = str(item['_id'])
        result.append(item)
    return jsonify(result)

# For backward compatibility
@app.route("/grocery-products")
def get_grocery_products_old():
    grocery_collection = mongo.db["Grocery Products"]  # Use quotes for space
    groceries = grocery_collection.find()
    result = []
    for item in groceries:
        item['_id'] = str(item['_id'])
        result.append(item)
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
