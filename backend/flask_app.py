from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import json

app = Flask(__name__)
CORS(app)

# MongoDB Atlas URI
mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/"
client = MongoClient(mongo_uri)
db = client["safebite"]  # Database name
collection = db["Grocery Products"]  # Collection name

@app.route("/", methods=["GET"])
def index():
    """Root endpoint with API information"""
    return jsonify({
        "message": "SafeBite API v2.5",
        "status": "running",
        "endpoints": {
            "search": "/search?q=your_query",
            "product": "/product/:id"
        }
    })

@app.route("/search", methods=["GET"])
def search_item():
    """Search for grocery products by name"""
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Query parameter (q) is required"}), 400

    try:
        # Simple case-insensitive search using regex
        results = list(collection.find(
            {"name": {"$regex": query, "$options": "i"}}
        ).limit(10))
        
        # Convert ObjectId to string for JSON serialization
        for result in results:
            result["_id"] = str(result["_id"])
        
        if results:
            return jsonify(results)
        else:
            return jsonify({"message": "No products found matching your query"}), 404
    except Exception as e:
        print(f"Error searching MongoDB: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500

@app.route("/product/<product_id>", methods=["GET"])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        # Find product by ID
        result = collection.find_one({"_id": product_id})
        
        if result:
            result["_id"] = str(result["_id"])
            return jsonify(result)
        else:
            return jsonify({"message": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

@app.route("/status", methods=["GET"])
def status():
    """Check API and database status"""
    try:
        # Check MongoDB connection
        db_status = "connected" if client.admin.command('ping')['ok'] else "disconnected"
        
        # Count documents in collection
        doc_count = collection.count_documents({})
        
        return jsonify({
            "api_status": "running",
            "version": "2.5.0",
            "database_status": db_status,
            "document_count": doc_count
        })
    except Exception as e:
        return jsonify({
            "api_status": "running",
            "version": "2.5.0",
            "database_status": "error",
            "error": str(e)
        }), 500

if __name__ == "__main__":
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
