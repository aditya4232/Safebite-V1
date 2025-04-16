from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB Atlas URI
mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/"
client = MongoClient(mongo_uri)

db = client["safebite"]
collection = db["Grocery Products"]

@app.route("/api/grocery-products", methods=["GET"])
def search_item():
    query = request.args.get("search")
    if not query:
        return jsonify({"error": "Search query missing"}), 400

    result = collection.find_one(
        {"name": {"$regex": query, "$options": "i"}}
    )

    if result:
        result["_id"] = str(result["_id"])
        return jsonify(result)
    else:
        return jsonify({"message": "Item not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
