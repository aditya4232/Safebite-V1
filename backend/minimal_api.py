from flask import Flask, jsonify
from pymongo import MongoClient
import os

# Initialize Flask app
app = Flask(__name__)

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/"
DB_NAME = "safebite"
COLLECTION_NAME = "Grocery Products"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Root endpoint
@app.route("/")
def home():
    try:
        count = collection.count_documents({})
        return jsonify({
            "status": "API is running",
            "version": "1.0.0",
            "mongodb_connected": True,
            "collection": COLLECTION_NAME,
            "document_count": count
        })
    except Exception as e:
        return jsonify({
            "status": "API is running",
            "version": "1.0.0",
            "mongodb_connected": False,
            "error": str(e)
        })

# Test endpoint
@app.route("/test")
def test():
    return jsonify({"message": "Test endpoint working"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
