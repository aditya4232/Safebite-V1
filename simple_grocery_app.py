from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Custom JSON encoder to handle MongoDB ObjectId
from flask.json import JSONEncoder as BaseJSONEncoder

class JSONEncoder(BaseJSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

app.json_encoder = JSONEncoder

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/"
DB_NAME = "safebite"
COLLECTION_NAME = "Grocery Products"

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    product_count = collection.count_documents({})
    print(f"Connected to MongoDB Atlas: {DB_NAME}.{COLLECTION_NAME}")
    print(f"Document count: {product_count}")
    mongodb_connected = True
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    mongodb_connected = False
    collection = None

# Root endpoint
@app.route("/")
def home():
    try:
        if mongodb_connected and collection:
            count = collection.count_documents({})
            return jsonify({
                "status": "API is running",
                "version": "1.0.0",
                "mongodb_connected": True,
                "collection": COLLECTION_NAME,
                "document_count": count
            })
        else:
            return jsonify({
                "status": "API is running",
                "version": "1.0.0",
                "mongodb_connected": False,
                "error": "MongoDB connection failed"
            })
    except Exception as e:
        print(f"Error in home endpoint: {e}")
        return jsonify({
            "status": "API is running",
            "version": "1.0.0",
            "mongodb_connected": False,
            "error": str(e)
        })

# Get all grocery products with pagination
@app.route("/grocery")
def get_grocery():
    try:
        if not mongodb_connected or not collection:
            return jsonify({"error": "MongoDB connection failed"}), 500

        # Get query parameters
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))

        # Calculate skip for pagination
        skip = (page - 1) * limit

        # Get products with pagination
        products = list(collection.find().skip(skip).limit(limit))

        # Process products for JSON serialization
        for product in products:
            product["_id"] = str(product["_id"])

        # Return response
        return jsonify({
            "products": products,
            "total": len(products),
            "page": page,
            "limit": limit
        })
    except Exception as e:
        print(f"Error in get_grocery: {e}")
        return jsonify({"error": str(e)}), 500

# Search endpoint
@app.route("/search")
def search():
    try:
        if not mongodb_connected or not collection:
            return jsonify({"error": "MongoDB connection failed"}), 500

        # Get search query
        query = request.args.get("q", "")
        if not query:
            return jsonify({"error": "Search query is required"}), 400

        # Perform search
        results = list(collection.find({
            "$or": [
                {"product": {"$regex": query, "$options": "i"}},
                {"name": {"$regex": query, "$options": "i"}},
                {"brand": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]
        }).limit(20))

        # Process results for JSON serialization
        for result in results:
            result["_id"] = str(result["_id"])

        return jsonify({
            "results": results,
            "count": len(results),
            "query": query
        })
    except Exception as e:
        print(f"Error in search: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
