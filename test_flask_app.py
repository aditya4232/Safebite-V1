from flask import Flask, jsonify
from pymongo import MongoClient
from bson import ObjectId
import json

app = Flask(__name__)

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client.safebite

# Custom JSON encoder to handle ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

app.json_encoder = JSONEncoder

@app.route("/")
def home():
    return jsonify({"status": "API is running", "version": "1.0.0"})

@app.route("/status")
def status():
    return jsonify({"status": "API is running", "version": "1.0.0"})

@app.route("/api/products")
def get_products():
    # Get products with limit
    products = list(db.products.find().limit(10))
    return jsonify({
        "products": products,
        "total": db.products.count_documents({}),
        "page": 1,
        "totalPages": 1,
        "limit": 10
    })

@app.route("/api/groceryProducts")
def get_grocery_products():
    # Get grocery products with limit
    groceries = list(db["Grocery Products"].find().limit(10))
    return jsonify({
        "products": groceries,
        "total": db["Grocery Products"].count_documents({}),
        "page": 1,
        "totalPages": 1,
        "limit": 10
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
