from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
import json

# Initialize Flask app
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

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/"
DB_NAME = "safebite"
COLLECTION_NAME = "Grocery Products"

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    print(f"Connected to MongoDB Atlas: {DB_NAME}.{COLLECTION_NAME}")
    print(f"Document count: {collection.count_documents({})}")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    collection = None

# Root endpoint
@app.route("/")
def home():
    try:
        if collection:
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
            "error": str(e)
        })

# Get all grocery products with pagination
@app.route("/grocery")
@app.route("/grocery-products")
@app.route("/api/grocery")
@app.route("/api/grocery-products")
@app.route("/dataset/grocery")
@app.route("/dataset/groceryProducts")
@app.route("/dataset/products")
def get_grocery_products():
    try:
        if not collection:
            return jsonify({"error": "MongoDB connection failed"}), 500
            
        # Get query parameters
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        search = request.args.get("search", "")
        category = request.args.get("category", "")
        
        # Calculate skip for pagination
        skip = (page - 1) * limit
        
        # Build query
        query = {}
        
        # Add search filter if provided
        if search:
            query["$or"] = [
                {"product": {"$regex": search, "$options": "i"}},
                {"brand": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}}
            ]
        
        # Add category filter if provided
        if category and category.lower() != "all":
            query["category"] = {"$regex": category, "$options": "i"}
        
        # Get total count for pagination
        total_count = collection.count_documents(query)
        
        # Get products with pagination
        products = list(collection.find(query).skip(skip).limit(limit))
        
        # Process products for consistent field names
        for product in products:
            # Convert ObjectId to string
            product["_id"] = str(product["_id"])
            
            # Add collection info
            product["_collection"] = "grocery"
            
            # Add name field for consistency
            if "name" not in product and "product" in product:
                product["name"] = product["product"]
        
        # Return response
        return jsonify({
            "products": products,
            "total": total_count,
            "page": page,
            "totalPages": (total_count + limit - 1) // limit
        })
    except Exception as e:
        print(f"Error in get_grocery_products: {e}")
        return jsonify({"error": str(e)}), 500

# Search endpoint
@app.route("/search")
@app.route("/api/search")
@app.route("/api/dataset/search")
def search():
    try:
        if not collection:
            return jsonify({"error": "MongoDB connection failed"}), 500
            
        # Get query parameters
        query = request.args.get("q", "") or request.args.get("query", "")
        limit = int(request.args.get("limit", 20))
        
        if not query:
            return jsonify({"error": "Query parameter (q or query) is required"}), 400
        
        print(f"Searching for: {query}")
        
        # Try Atlas Search first
        try:
            # Use Atlas Search aggregation pipeline
            pipeline = [
                {
                    "$search": {
                        "index": "default",
                        "text": {
                            "query": query,
                            "path": {
                                "wildcard": "*"
                            }
                        }
                    }
                },
                {"$limit": limit}
            ]
            
            # Execute the aggregation pipeline
            results = list(collection.aggregate(pipeline))
            print(f"Found {len(results)} results with Atlas Search")
            
        except Exception as e:
            print(f"Atlas Search error: {e}, falling back to regex search")
            # Fallback to regex search
            search_query = {
                "$or": [
                    {"product": {"$regex": query, "$options": "i"}},
                    {"brand": {"$regex": query, "$options": "i"}},
                    {"category": {"$regex": query, "$options": "i"}},
                    {"sub_category": {"$regex": query, "$options": "i"}}
                ]
            }
            results = list(collection.find(search_query).limit(limit))
            print(f"Found {len(results)} results with regex search")
        
        # Process results
        for result in results:
            # Convert ObjectId to string
            result["_id"] = str(result["_id"])
            
            # Add collection info
            result["_collection"] = "grocery"
            
            # Add name field for consistency
            if "name" not in result and "product" in result:
                result["name"] = result["product"]
        
        # Return response
        return jsonify({
            "results": results,
            "items": results,  # For compatibility with frontend
            "count": len(results),
            "query": query
        })
    except Exception as e:
        print(f"Error in search: {e}")
        return jsonify({"error": str(e)}), 500

# Get product by ID
@app.route("/grocery/<product_id>")
@app.route("/grocery-products/<product_id>")
@app.route("/api/grocery/<product_id>")
@app.route("/api/grocery-products/<product_id>")
@app.route("/dataset/grocery/<product_id>")
@app.route("/dataset/groceryProducts/<product_id>")
@app.route("/dataset/products/<product_id>")
def get_product(product_id):
    try:
        if not collection:
            return jsonify({"error": "MongoDB connection failed"}), 500
            
        # Try to find product by ID
        product = None
        try:
            product = collection.find_one({"_id": ObjectId(product_id)})
        except:
            try:
                product = collection.find_one({"_id": product_id})
            except Exception as e:
                print(f"Error finding product by string ID: {e}")
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        # Convert ObjectId to string
        product["_id"] = str(product["_id"])
        
        # Add collection info
        product["_collection"] = "grocery"
        
        # Add name field for consistency
        if "name" not in product and "product" in product:
            product["name"] = product["product"]
        
        # Return product
        return jsonify(product)
    except Exception as e:
        print(f"Error in get_product: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
