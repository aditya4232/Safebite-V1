from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from waitress import serve

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/crawl', methods=['GET'])
def mock_crawl_food_sites():
    """Returns mock data for food delivery"""
    mock_data = [
        {"restaurant": "Mock Restaurant 1", "redirect": "https://www.swiggy.com/mock1"},
        {"restaurant": "Mock Restaurant 2", "redirect": "https://www.zomato.com/mock2"}
    ]
    return jsonify(mock_data)

# Root endpoint
@app.route("/", methods=["GET"])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "message": "SafeBite API v2.5",
        "status": "running",
        "mongodb_connected": False,
        "endpoints": {
            "grocery": "/grocery-products",
            "search": "/search?q=your_query"
        }
    })

if __name__ == "__main__":
    # Run the app
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting server on port {port}")
    serve(app, host="0.0.0.0", port=port)
