from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/food-delivery', methods=['GET'])
def get_food_delivery():
    """Returns food delivery options from Swiggy and Zomato"""
    food = request.args.get('food', '')
    city = request.args.get('city', '')

    if not food or not city:
        return jsonify({"error": "Both food and city parameters are required"}), 400

    logger.info(f"Searching for {food} in {city}")

    # In a real implementation, you would scrape or use APIs from Swiggy and Zomato
    # For now, we'll return realistic mock data based on the search parameters

    # Generate realistic restaurant names based on the food query
    food_type = food.lower()
    city_name = city.capitalize()

    # Define cuisine types based on food query
    cuisine_map = {
        "pizza": "Italian",
        "burger": "American",
        "pasta": "Italian",
        "biryani": "Indian",
        "curry": "Indian",
        "noodles": "Chinese",
        "sushi": "Japanese",
        "tacos": "Mexican",
        "paneer": "North Indian",
        "dosa": "South Indian",
        "idli": "South Indian",
        "sandwich": "Continental",
        "salad": "Healthy Food",
        "ice cream": "Desserts"
    }

    # Determine cuisine based on food type
    cuisine = "Various"
    for key, value in cuisine_map.items():
        if key in food_type:
            cuisine = value
            break

    # Generate popular dishes based on food type and cuisine
    popular_dishes = []
    if "pizza" in food_type:
        popular_dishes = ["Margherita Pizza", "Pepperoni Pizza", "Cheese Pizza", "Veggie Supreme"]
    elif "burger" in food_type:
        popular_dishes = ["Cheese Burger", "Veggie Burger", "Chicken Burger", "Double Patty Burger"]
    elif "biryani" in food_type:
        popular_dishes = ["Chicken Biryani", "Mutton Biryani", "Veg Biryani", "Hyderabadi Biryani"]
    elif "paneer" in food_type:
        popular_dishes = ["Paneer Butter Masala", "Kadai Paneer", "Paneer Tikka", "Shahi Paneer"]
    elif "pasta" in food_type:
        popular_dishes = ["Alfredo Pasta", "Penne Arrabiata", "Spaghetti", "Pasta Carbonara"]
    else:
        # Generic popular dishes
        popular_dishes = [f"{food_type.capitalize()} Special", f"Spicy {food_type.capitalize()}",
                         f"Classic {food_type.capitalize()}", f"House {food_type.capitalize()}"]

    # Proper redirect URLs for Swiggy and Zomato
    swiggy_results = [
        {
            "restaurant": f"{city_name} {food_type.capitalize()} House",
            "redirect": f"https://www.swiggy.com/search?query={food_type.replace(' ', '%20')}%20{city.lower().replace(' ', '%20')}",
            "rating": 4.2,
            "delivery_time": "30-35 min",
            "price_range": "₹₹",
            "source": "Swiggy",
            "cuisine": cuisine,
            "popular_dishes": popular_dishes[:2],
            "address": f"Road No. 12, {city_name} Central"
        },
        {
            "restaurant": f"The {food_type.capitalize()} Factory",
            "redirect": f"https://www.swiggy.com/search?query={food_type.replace(' ', '%20')}%20{city.lower().replace(' ', '%20')}",
            "rating": 4.0,
            "delivery_time": "25-30 min",
            "price_range": "₹₹₹",
            "source": "Swiggy",
            "cuisine": cuisine,
            "popular_dishes": popular_dishes[1:3],
            "address": f"Jubilee Hills, {city_name}"
        },
        {
            "restaurant": f"{food_type.capitalize()} Express",
            "redirect": f"https://www.swiggy.com/search?query={food_type.replace(' ', '%20')}%20{city.lower().replace(' ', '%20')}",
            "rating": 3.8,
            "delivery_time": "40-45 min",
            "price_range": "₹",
            "source": "Swiggy",
            "cuisine": cuisine,
            "popular_dishes": popular_dishes[2:],
            "address": f"Hitech City, {city_name}"
        }
    ]

    zomato_results = [
        {
            "restaurant": f"Royal {food_type.capitalize()}",
            "redirect": f"https://www.zomato.com/search?q={food_type.replace(' ', '%20')}%20{city.lower().replace(' ', '%20')}",
            "rating": 4.3,
            "delivery_time": "35-40 min",
            "price_range": "₹₹₹",
            "source": "Zomato",
            "cuisine": cuisine,
            "popular_dishes": popular_dishes[:2],
            "address": f"Banjara Hills, {city_name}"
        },
        {
            "restaurant": f"{city_name} {food_type.capitalize()} Corner",
            "redirect": f"https://www.zomato.com/search?q={food_type.replace(' ', '%20')}%20{city.lower().replace(' ', '%20')}",
            "rating": 4.1,
            "delivery_time": "30-35 min",
            "price_range": "₹₹",
            "source": "Zomato",
            "cuisine": cuisine,
            "popular_dishes": popular_dishes[1:3],
            "address": f"Madhapur, {city_name}"
        },
        {
            "restaurant": f"Authentic {food_type.capitalize()}",
            "redirect": f"https://www.zomato.com/search?q={food_type.replace(' ', '%20')}%20{city.lower().replace(' ', '%20')}",
            "rating": 3.9,
            "delivery_time": "45-50 min",
            "price_range": "₹₹₹₹",
            "source": "Zomato",
            "cuisine": cuisine,
            "popular_dishes": popular_dishes[2:],
            "address": f"Gachibowli, {city_name}"
        }
    ]

    # Combine results
    results = swiggy_results + zomato_results

    return jsonify(results)

# Root endpoint
@app.route("/", methods=["GET"])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "message": "SafeBite Food Delivery API",
        "status": "running",
        "endpoints": {
            "food_delivery": "/api/food-delivery?food=pizza&city=mumbai"
        }
    })

if __name__ == "__main__":
    # Run the app
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting food delivery API server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
