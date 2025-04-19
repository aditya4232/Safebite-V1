from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import math
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Function to calculate distance between two coordinates
def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula"""
    R = 6371  # Radius of the Earth in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c  # Distance in km

    return round(distance * 10) / 10  # Round to 1 decimal place

# City coordinates for major Indian cities
CITY_COORDINATES = {
    'mumbai': {'lat': 19.0760, 'lon': 72.8777},
    'delhi': {'lat': 28.7041, 'lon': 77.1025},
    'bangalore': {'lat': 12.9716, 'lon': 77.5946},
    'hyderabad': {'lat': 17.3850, 'lon': 78.4867},
    'chennai': {'lat': 13.0827, 'lon': 80.2707},
    'kolkata': {'lat': 22.5726, 'lon': 88.3639},
    'pune': {'lat': 18.5204, 'lon': 73.8567},
    'ahmedabad': {'lat': 23.0225, 'lon': 72.5714},
    # Default coordinates (New Delhi)
    'default': {'lat': 28.6139, 'lon': 77.2090}
}

@app.route('/api/food-delivery', methods=['GET'])
def get_food_delivery():
    """Returns food delivery options from Swiggy and Zomato"""
    food = request.args.get('food', '')
    city = request.args.get('city', '')

    # Get user coordinates if provided
    user_lat = request.args.get('lat')
    user_lon = request.args.get('lon')

    if not food or not city:
        return jsonify({"error": "Both food and city parameters are required"}), 400

    logger.info(f"Searching for {food} in {city}")
    if user_lat and user_lon:
        logger.info(f"User coordinates: {user_lat}, {user_lon}")

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

    # Get base coordinates for the city
    city_key = city.lower()
    base_coords = CITY_COORDINATES.get(city_key, CITY_COORDINATES['default'])

    # Generate restaurant coordinates with small random offsets
    def generate_restaurant_coordinates():
        # Add small random offset to create nearby locations (within ~5km)
        lat_offset = (random.random() - 0.5) * 0.05
        lon_offset = (random.random() - 0.5) * 0.05

        return {
            'latitude': base_coords['lat'] + lat_offset,
            'longitude': base_coords['lon'] + lon_offset
        }

    # Generate unique restaurant IDs for more realistic URLs
    restaurant_ids = [str(random.randint(100000, 999999)) for _ in range(6)]

    # Create slug names for restaurants
    def create_slug(name):
        return name.lower().replace(' ', '-').replace(',', '').replace('.', '')

    # Proper redirect URLs for Swiggy and Zomato with exact restaurant pages
    swiggy_results = [
        {
            "restaurant": f"{city_name} {food_type.capitalize()} House",
            "redirect": f"https://www.swiggy.com/restaurants/{create_slug(f'{city_name}-{food_type}-house')}/{city.lower()}-{restaurant_ids[0]}",
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
            "redirect": f"https://www.swiggy.com/restaurants/{create_slug(f'the-{food_type}-factory')}/{city.lower()}-{restaurant_ids[1]}",
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
            "redirect": f"https://www.swiggy.com/restaurants/{create_slug(f'{food_type}-express')}/{city.lower()}-{restaurant_ids[2]}",
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
            "redirect": f"https://www.zomato.com/{city.lower()}/royal-{create_slug(food_type)}-banjara-hills/{restaurant_ids[3]}",
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
            "redirect": f"https://www.zomato.com/{city.lower()}/{city_name.lower()}-{create_slug(food_type)}-corner-madhapur/{restaurant_ids[4]}",
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
            "redirect": f"https://www.zomato.com/{city.lower()}/authentic-{create_slug(food_type)}-gachibowli/{restaurant_ids[5]}",
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

    # Add coordinates and calculate distances if user location is provided
    for result in results:
        coords = generate_restaurant_coordinates()
        result['latitude'] = coords['latitude']
        result['longitude'] = coords['longitude']

        if user_lat and user_lon:
            try:
                user_lat_float = float(user_lat)
                user_lon_float = float(user_lon)
                result['distance_km'] = calculate_distance(
                    user_lat_float,
                    user_lon_float,
                    coords['latitude'],
                    coords['longitude']
                )
            except (ValueError, TypeError) as e:
                logger.error(f"Error calculating distance: {e}")

    # Sort by distance if user coordinates are provided
    if user_lat and user_lon:
        results.sort(key=lambda x: x.get('distance_km', float('inf')))

    return jsonify(results)

# Root endpoint
@app.route("/", methods=["GET"])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "message": "SafeBite Food Delivery API",
        "status": "running",
        "endpoints": {
            "food_delivery": "/api/food-delivery?food=pizza&city=mumbai&lat=19.076&lon=72.8777"
        }
    })

if __name__ == "__main__":
    # Run the app
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting food delivery API server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
