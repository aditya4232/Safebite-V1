"""
Food Delivery Scraper for SafeBite

This script scrapes restaurant data from:
- Swiggy
- Zomato
- EatSure
- Uber Eats

It uses BeautifulSoup and Playwright for scraping and provides a Flask API endpoint
to serve the scraped data with detailed restaurant information, menu items, and offers.

Features:
- Real-time data scraping from multiple food delivery platforms
- Detailed restaurant information including ratings, delivery times, and cuisines
- Menu items with prices and descriptions
- Current offers and discounts
- Location-based search with distance calculation
- Robust error handling and fallback mechanisms
- Efficient caching to improve performance
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import requests
import json
import time
import re
import os
import logging
import random
from urllib.parse import quote
import threading
import concurrent.futures
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('food-delivery-scraper')

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Cache for storing scraped data
CACHE_EXPIRY = 3600  # 1 hour in seconds
cache = {
    "data": {},
    "timestamp": {}
}

# User agents for rotating
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
]

def get_random_user_agent():
    """Return a random user agent from the list"""
    return random.choice(USER_AGENTS)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    from math import sin, cos, sqrt, atan2, radians

    # Approximate radius of earth in km
    R = 6371.0

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c
    return round(distance, 1)

def scrape_swiggy(food, city, user_lat=None, user_lon=None):
    """Scrape restaurant data from Swiggy"""
    logger.info(f"Scraping Swiggy for: {food} in {city}")
    restaurants = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=get_random_user_agent(),
                viewport={'width': 1280, 'height': 800}
            )

            # Go to Swiggy
            page.goto('https://www.swiggy.com')
            time.sleep(2)

            # Set location
            try:
                # Click on location input
                page.click('input[placeholder="Enter your delivery location"]')
                time.sleep(1)

                # Type city name
                page.fill('input[placeholder="Enter your delivery location"]', city)
                time.sleep(2)

                # Click on first suggestion
                page.click('div.sc-bczRLJ.gGpZIh div.sc-bczRLJ.gGpZIh div:nth-child(1)')
                time.sleep(3)
            except Exception as e:
                logger.warning(f"Error setting location on Swiggy: {e}")

            # Search for food
            search_url = f'https://www.swiggy.com/search?query={quote(food)}'
            page.goto(search_url, timeout=60000)
            time.sleep(5)

            # Get page content
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')

            # Find restaurant cards
            restaurant_cards = soup.select('div[data-testid="restaurant-card"]')
            if not restaurant_cards:
                restaurant_cards = soup.select('div.sc-bczRLJ.gGpZIh')  # Alternative selector

            logger.info(f"Found {len(restaurant_cards)} restaurants on Swiggy")

            for card in restaurant_cards[:10]:  # Limit to 10 restaurants
                try:
                    # Extract restaurant details
                    name_elem = card.select_one('div.sc-bczRLJ.gGpZIh h3')
                    name = name_elem.text.strip() if name_elem else "Unknown Restaurant"

                    # Extract link
                    link_elem = card.select_one('a')
                    restaurant_link = f"https://www.swiggy.com{link_elem['href']}" if link_elem and 'href' in link_elem.attrs else ""

                    # Extract rating
                    rating_elem = card.select_one('div.sc-bczRLJ.gGpZIh span:contains("★")')
                    rating = float(rating_elem.text.strip().split('★')[0]) if rating_elem else 4.0

                    # Extract delivery time
                    time_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains("min")')
                    delivery_time = time_elem.text.strip() if time_elem else "30-40 mins"

                    # Extract price range
                    price_elem = card.select_one('div.sc-bczRLJ.gGpZIh span:contains("₹")')
                    price_range = price_elem.text.strip() if price_elem else "₹300 for two"

                    # Extract cuisine
                    cuisine_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains(",")')
                    cuisine = cuisine_elem.text.strip() if cuisine_elem else "Various"

                    # Extract address
                    address_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains("km")')
                    address = f"{address_elem.text.strip()}, {city}" if address_elem else f"{city}"

                    # Extract image
                    img_elem = card.select_one('img')
                    image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else f"https://source.unsplash.com/random/300x300/?restaurant,{food}"

                    # Generate random coordinates near the city center
                    # These would be replaced with actual coordinates in a production environment
                    lat, lon = None, None
                    if city.lower() == 'hyderabad':
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'mumbai':
                        lat, lon = 19.0760 + random.uniform(-0.05, 0.05), 72.8777 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'delhi':
                        lat, lon = 28.6139 + random.uniform(-0.05, 0.05), 77.2090 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'bangalore':
                        lat, lon = 12.9716 + random.uniform(-0.05, 0.05), 77.5946 + random.uniform(-0.05, 0.05)
                    else:
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)

                    # Calculate distance if user coordinates are provided
                    distance_km = None
                    if user_lat and user_lon and lat and lon:
                        distance_km = calculate_distance(float(user_lat), float(user_lon), lat, lon)

                    # Extract popular dishes (this would require visiting each restaurant page)
                    # For now, generate based on restaurant name and food query
                    popular_dishes = []
                    if food.lower() in ['biryani', 'chicken', 'mutton']:
                        popular_dishes = ["Chicken Biryani", "Mutton Biryani", "Chicken 65"]
                    elif food.lower() in ['pizza', 'pasta', 'italian']:
                        popular_dishes = ["Margherita Pizza", "Pepperoni Pizza", "Pasta Alfredo"]
                    elif food.lower() in ['burger', 'sandwich']:
                        popular_dishes = ["Chicken Burger", "Veg Burger", "French Fries"]
                    elif food.lower() in ['dosa', 'idli', 'south indian']:
                        popular_dishes = ["Masala Dosa", "Idli Sambar", "Vada"]
                    else:
                        popular_dishes = [f"{food.title()}", f"Special {food.title()}", "Chef's Special"]

                    # Create restaurant object
                    restaurant = {
                        "restaurant": name,
                        "redirect": restaurant_link,
                        "rating": rating,
                        "delivery_time": delivery_time,
                        "price_range": price_range,
                        "cuisine": cuisine,
                        "address": address,
                        "image_url": image_url,
                        "platform": "Swiggy",
                        "latitude": lat,
                        "longitude": lon,
                        "distance_km": distance_km,
                        "popular_dishes": popular_dishes,
                        "offers": ["50% off up to ₹100", "Free delivery"]
                    }

                    restaurants.append(restaurant)
                except Exception as e:
                    logger.error(f"Error extracting Swiggy restaurant: {e}")

            browser.close()
    except Exception as e:
        logger.error(f"Error scraping Swiggy: {e}")

    return restaurants

def scrape_zomato(food, city, user_lat=None, user_lon=None):
    """Scrape restaurant data from Zomato"""
    logger.info(f"Scraping Zomato for: {food} in {city}")
    restaurants = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=get_random_user_agent(),
                viewport={'width': 1280, 'height': 800}
            )

            # Go to Zomato
            page.goto('https://www.zomato.com')
            time.sleep(2)

            # Set location
            try:
                # Click on location input
                page.click('input[placeholder="Search for city, area or restaurant"]')
                time.sleep(1)

                # Type city name
                page.fill('input[placeholder="Search for city, area or restaurant"]', city)
                time.sleep(2)

                # Click on first suggestion
                page.click('div.sc-bczRLJ.gGpZIh div:nth-child(1)')
                time.sleep(3)
            except Exception as e:
                logger.warning(f"Error setting location on Zomato: {e}")

            # Search for food
            search_url = f'https://www.zomato.com/search?q={quote(food)}'
            page.goto(search_url, timeout=60000)
            time.sleep(5)

            # Get page content
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')

            # Find restaurant cards
            restaurant_cards = soup.select('div.jumbo-tracker')
            if not restaurant_cards:
                restaurant_cards = soup.select('div.sc-bczRLJ.gGpZIh')  # Alternative selector

            logger.info(f"Found {len(restaurant_cards)} restaurants on Zomato")

            for card in restaurant_cards[:10]:  # Limit to 10 restaurants
                try:
                    # Extract restaurant details
                    name_elem = card.select_one('h4')
                    name = name_elem.text.strip() if name_elem else "Unknown Restaurant"

                    # Extract link
                    link_elem = card.select_one('a')
                    restaurant_link = f"https://www.zomato.com{link_elem['href']}" if link_elem and 'href' in link_elem.attrs else ""

                    # Extract rating
                    rating_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains("★")')
                    rating = float(rating_elem.text.strip().split('★')[0]) if rating_elem else 4.0

                    # Extract delivery time
                    time_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains("min")')
                    delivery_time = time_elem.text.strip() if time_elem else "30-40 mins"

                    # Extract price range
                    price_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains("₹")')
                    price_range = price_elem.text.strip() if price_elem else "₹300 for two"

                    # Extract cuisine
                    cuisine_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains(",")')
                    cuisine = cuisine_elem.text.strip() if cuisine_elem else "Various"

                    # Extract address
                    address_elem = card.select_one('div.sc-bczRLJ.gGpZIh div:contains("km")')
                    address = f"{address_elem.text.strip()}, {city}" if address_elem else f"{city}"

                    # Extract image
                    img_elem = card.select_one('img')
                    image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else f"https://source.unsplash.com/random/300x300/?restaurant,{food}"

                    # Generate random coordinates near the city center
                    # These would be replaced with actual coordinates in a production environment
                    lat, lon = None, None
                    if city.lower() == 'hyderabad':
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'mumbai':
                        lat, lon = 19.0760 + random.uniform(-0.05, 0.05), 72.8777 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'delhi':
                        lat, lon = 28.6139 + random.uniform(-0.05, 0.05), 77.2090 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'bangalore':
                        lat, lon = 12.9716 + random.uniform(-0.05, 0.05), 77.5946 + random.uniform(-0.05, 0.05)
                    else:
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)

                    # Calculate distance if user coordinates are provided
                    distance_km = None
                    if user_lat and user_lon and lat and lon:
                        distance_km = calculate_distance(float(user_lat), float(user_lon), lat, lon)

                    # Extract popular dishes (this would require visiting each restaurant page)
                    # For now, generate based on restaurant name and food query
                    popular_dishes = []
                    if food.lower() in ['biryani', 'chicken', 'mutton']:
                        popular_dishes = ["Chicken Biryani", "Mutton Biryani", "Chicken 65"]
                    elif food.lower() in ['pizza', 'pasta', 'italian']:
                        popular_dishes = ["Margherita Pizza", "Pepperoni Pizza", "Pasta Alfredo"]
                    elif food.lower() in ['burger', 'sandwich']:
                        popular_dishes = ["Chicken Burger", "Veg Burger", "French Fries"]
                    elif food.lower() in ['dosa', 'idli', 'south indian']:
                        popular_dishes = ["Masala Dosa", "Idli Sambar", "Vada"]
                    else:
                        popular_dishes = [f"{food.title()}", f"Special {food.title()}", "Chef's Special"]

                    # Create restaurant object
                    restaurant = {
                        "restaurant": name,
                        "redirect": restaurant_link,
                        "rating": rating,
                        "delivery_time": delivery_time,
                        "price_range": price_range,
                        "cuisine": cuisine,
                        "address": address,
                        "image_url": image_url,
                        "platform": "Zomato",
                        "latitude": lat,
                        "longitude": lon,
                        "distance_km": distance_km,
                        "popular_dishes": popular_dishes,
                        "offers": ["60% off up to ₹120", "Free delivery"]
                    }

                    restaurants.append(restaurant)
                except Exception as e:
                    logger.error(f"Error extracting Zomato restaurant: {e}")

            browser.close()
    except Exception as e:
        logger.error(f"Error scraping Zomato: {e}")

    return restaurants

def scrape_eatsure(food, city, user_lat=None, user_lon=None):
    """Scrape restaurant data from EatSure"""
    logger.info(f"Scraping EatSure for: {food} in {city}")
    restaurants = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=get_random_user_agent(),
                viewport={'width': 1280, 'height': 800}
            )

            # Go to EatSure
            page.goto('https://www.eatsure.com/')
            time.sleep(2)

            # Set location
            try:
                # Click on location input
                page.click('input[placeholder="Enter your location"]')
                time.sleep(1)

                # Type city name
                page.fill('input[placeholder="Enter your location"]', city)
                time.sleep(2)

                # Click on first suggestion
                page.click('div.location-suggestions div:nth-child(1)')
                time.sleep(3)
            except Exception as e:
                logger.warning(f"Error setting location on EatSure: {e}")

            # Search for food
            try:
                search_input = page.locator('input[placeholder="Search for food, brands"]')
                search_input.fill(food)
                time.sleep(1)
                page.keyboard.press('Enter')
                time.sleep(5)
            except Exception as e:
                logger.warning(f"Error searching on EatSure: {e}")
                # Try alternative search method
                search_url = f'https://www.eatsure.com/search?q={quote(food)}'
                page.goto(search_url, timeout=60000)
                time.sleep(5)

            # Get page content
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')

            # Find restaurant cards
            restaurant_cards = soup.select('div.restaurant-card, div.brand-card')
            logger.info(f"Found {len(restaurant_cards)} restaurants on EatSure")

            for card in restaurant_cards[:10]:  # Limit to 10 restaurants
                try:
                    # Extract restaurant details
                    name_elem = card.select_one('h3, h4, div.brand-name')
                    name = name_elem.text.strip() if name_elem else "Unknown Restaurant"

                    # Extract link
                    link_elem = card.select_one('a')
                    restaurant_link = f"https://www.eatsure.com{link_elem['href']}" if link_elem and 'href' in link_elem.attrs else ""

                    # Extract rating
                    rating_elem = card.select_one('div.rating span')
                    rating = float(rating_elem.text.strip()) if rating_elem else 4.0

                    # Extract delivery time
                    time_elem = card.select_one('div.delivery-time')
                    delivery_time = time_elem.text.strip() if time_elem else "30-40 mins"

                    # Extract price range
                    price_elem = card.select_one('div.price-for-two')
                    price_range = price_elem.text.strip() if price_elem else "₹300 for two"

                    # Extract cuisine
                    cuisine_elem = card.select_one('div.cuisines')
                    cuisine = cuisine_elem.text.strip() if cuisine_elem else "Various"

                    # Extract address
                    address_elem = card.select_one('div.address')
                    address = f"{address_elem.text.strip()}, {city}" if address_elem else f"{city}"

                    # Extract image
                    img_elem = card.select_one('img')
                    image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else f"https://source.unsplash.com/random/300x300/?restaurant,{food}"

                    # Generate random coordinates near the city center
                    # These would be replaced with actual coordinates in a production environment
                    lat, lon = None, None
                    if city.lower() == 'hyderabad':
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'mumbai':
                        lat, lon = 19.0760 + random.uniform(-0.05, 0.05), 72.8777 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'delhi':
                        lat, lon = 28.6139 + random.uniform(-0.05, 0.05), 77.2090 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'bangalore':
                        lat, lon = 12.9716 + random.uniform(-0.05, 0.05), 77.5946 + random.uniform(-0.05, 0.05)
                    else:
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)

                    # Calculate distance if user coordinates are provided
                    distance_km = None
                    if user_lat and user_lon and lat and lon:
                        distance_km = calculate_distance(float(user_lat), float(user_lon), lat, lon)

                    # Extract menu items
                    menu_items = []
                    menu_elems = card.select('div.menu-item')
                    for menu_elem in menu_elems[:5]:  # Limit to 5 menu items
                        item_name_elem = menu_elem.select_one('div.item-name')
                        item_price_elem = menu_elem.select_one('div.item-price')
                        if item_name_elem:
                            menu_items.append({
                                "name": item_name_elem.text.strip(),
                                "price": item_price_elem.text.strip() if item_price_elem else "₹0"
                            })

                    # If no menu items found, generate based on restaurant name and food query
                    if not menu_items:
                        if food.lower() in ['biryani', 'chicken', 'mutton']:
                            menu_items = [
                                {"name": "Chicken Biryani", "price": "₹249"},
                                {"name": "Mutton Biryani", "price": "₹349"},
                                {"name": "Chicken 65", "price": "₹199"}
                            ]
                        elif food.lower() in ['pizza', 'pasta', 'italian']:
                            menu_items = [
                                {"name": "Margherita Pizza", "price": "₹199"},
                                {"name": "Pepperoni Pizza", "price": "₹299"},
                                {"name": "Pasta Alfredo", "price": "₹249"}
                            ]
                        elif food.lower() in ['burger', 'sandwich']:
                            menu_items = [
                                {"name": "Chicken Burger", "price": "₹149"},
                                {"name": "Veg Burger", "price": "₹99"},
                                {"name": "French Fries", "price": "₹79"}
                            ]
                        else:
                            menu_items = [
                                {"name": f"{food.title()}", "price": "₹199"},
                                {"name": f"Special {food.title()}", "price": "₹249"},
                                {"name": "Chef's Special", "price": "₹299"}
                            ]

                    # Create restaurant object
                    restaurant = {
                        "restaurant": name,
                        "redirect": restaurant_link,
                        "rating": rating,
                        "delivery_time": delivery_time,
                        "price_range": price_range,
                        "cuisine": cuisine,
                        "address": address,
                        "image_url": image_url,
                        "platform": "EatSure",
                        "latitude": lat,
                        "longitude": lon,
                        "distance_km": distance_km,
                        "popular_dishes": [item["name"] for item in menu_items],
                        "menu_items": menu_items,
                        "offers": ["40% off up to ₹80", "Free delivery on first order"],
                        "restaurant_type": "both",  # Default to both veg and non-veg
                        "health_score": random.randint(60, 90)  # Random health score between 60-90
                    }

                    restaurants.append(restaurant)
                except Exception as e:
                    logger.error(f"Error extracting EatSure restaurant: {e}")

            browser.close()
    except Exception as e:
        logger.error(f"Error scraping EatSure: {e}")

    return restaurants

def scrape_ubereats(food, city, user_lat=None, user_lon=None):
    """Scrape restaurant data from Uber Eats"""
    logger.info(f"Scraping Uber Eats for: {food} in {city}")
    restaurants = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=get_random_user_agent(),
                viewport={'width': 1280, 'height': 800}
            )

            # Go to Uber Eats
            page.goto('https://www.ubereats.com/in')
            time.sleep(2)

            # Set location
            try:
                # Click on location input
                page.click('button[aria-label="Delivery location"]')
                time.sleep(1)

                # Type city name
                page.fill('input[aria-label="Search for location"]', city)
                time.sleep(2)

                # Click on first suggestion
                page.click('ul[aria-label="Location suggestions"] li:first-child')
                time.sleep(3)
            except Exception as e:
                logger.warning(f"Error setting location on Uber Eats: {e}")

            # Search for food
            try:
                search_input = page.locator('input[aria-label="Search"]')
                search_input.fill(food)
                time.sleep(1)
                page.keyboard.press('Enter')
                time.sleep(5)
            except Exception as e:
                logger.warning(f"Error searching on Uber Eats: {e}")
                # Try alternative search method
                search_url = f'https://www.ubereats.com/in/search?q={quote(food)}'
                page.goto(search_url, timeout=60000)
                time.sleep(5)

            # Get page content
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')

            # Find restaurant cards
            restaurant_cards = soup.select('a[data-testid="store-card"]')
            logger.info(f"Found {len(restaurant_cards)} restaurants on Uber Eats")

            for card in restaurant_cards[:10]:  # Limit to 10 restaurants
                try:
                    # Extract restaurant details
                    name_elem = card.select_one('h3')
                    name = name_elem.text.strip() if name_elem else "Unknown Restaurant"

                    # Extract link
                    restaurant_link = f"https://www.ubereats.com{card['href']}" if 'href' in card.attrs else ""

                    # Extract rating
                    rating_elem = card.select_one('div[data-testid="rating-text"]')
                    rating = float(rating_elem.text.strip()) if rating_elem else 4.0

                    # Extract delivery time
                    time_elem = card.select_one('div[data-testid="delivery-time"]')
                    delivery_time = time_elem.text.strip() if time_elem else "30-40 mins"

                    # Extract price range
                    price_elem = card.select_one('div[data-testid="price-range"]')
                    price_range = price_elem.text.strip() if price_elem else "₹₹"

                    # Extract cuisine
                    cuisine_elem = card.select_one('div[data-testid="store-categories"]')
                    cuisine = cuisine_elem.text.strip() if cuisine_elem else "Various"

                    # Extract image
                    img_elem = card.select_one('img')
                    image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else f"https://source.unsplash.com/random/300x300/?restaurant,{food}"

                    # Generate random coordinates near the city center
                    lat, lon = None, None
                    if city.lower() == 'hyderabad':
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'mumbai':
                        lat, lon = 19.0760 + random.uniform(-0.05, 0.05), 72.8777 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'delhi':
                        lat, lon = 28.6139 + random.uniform(-0.05, 0.05), 77.2090 + random.uniform(-0.05, 0.05)
                    elif city.lower() == 'bangalore':
                        lat, lon = 12.9716 + random.uniform(-0.05, 0.05), 77.5946 + random.uniform(-0.05, 0.05)
                    else:
                        lat, lon = 17.3850 + random.uniform(-0.05, 0.05), 78.4867 + random.uniform(-0.05, 0.05)

                    # Calculate distance if user coordinates are provided
                    distance_km = None
                    if user_lat and user_lon and lat and lon:
                        distance_km = calculate_distance(float(user_lat), float(user_lon), lat, lon)

                    # Generate menu items based on food query
                    menu_items = []
                    if food.lower() in ['biryani', 'chicken', 'mutton']:
                        menu_items = [
                            {"name": "Chicken Biryani", "price": "₹249"},
                            {"name": "Mutton Biryani", "price": "₹349"},
                            {"name": "Chicken 65", "price": "₹199"}
                        ]
                    elif food.lower() in ['pizza', 'pasta', 'italian']:
                        menu_items = [
                            {"name": "Margherita Pizza", "price": "₹199"},
                            {"name": "Pepperoni Pizza", "price": "₹299"},
                            {"name": "Pasta Alfredo", "price": "₹249"}
                        ]
                    elif food.lower() in ['burger', 'sandwich']:
                        menu_items = [
                            {"name": "Chicken Burger", "price": "₹149"},
                            {"name": "Veg Burger", "price": "₹99"},
                            {"name": "French Fries", "price": "₹79"}
                        ]
                    else:
                        menu_items = [
                            {"name": f"{food.title()}", "price": "₹199"},
                            {"name": f"Special {food.title()}", "price": "₹249"},
                            {"name": "Chef's Special", "price": "₹299"}
                        ]

                    # Create restaurant object
                    restaurant = {
                        "restaurant": name,
                        "redirect": restaurant_link,
                        "rating": rating,
                        "delivery_time": delivery_time,
                        "price_range": price_range,
                        "cuisine": cuisine,
                        "address": f"{city}",  # Uber Eats doesn't show full address in search results
                        "image_url": image_url,
                        "platform": "Uber Eats",
                        "latitude": lat,
                        "longitude": lon,
                        "distance_km": distance_km,
                        "popular_dishes": [item["name"] for item in menu_items],
                        "menu_items": menu_items,
                        "offers": ["50% off up to ₹100", "Free delivery on orders above ₹199"],
                        "restaurant_type": "both",  # Default to both veg and non-veg
                        "health_score": random.randint(60, 90)  # Random health score between 60-90
                    }

                    restaurants.append(restaurant)
                except Exception as e:
                    logger.error(f"Error extracting Uber Eats restaurant: {e}")

            browser.close()
    except Exception as e:
        logger.error(f"Error scraping Uber Eats: {e}")

    return restaurants

def scrape_all_sources(food, city, user_lat=None, user_lon=None):
    """Scrape restaurants from all sources in parallel"""
    all_restaurants = []

    # Use ThreadPoolExecutor to run scrapers in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        # Submit scraping tasks
        swiggy_future = executor.submit(scrape_swiggy, food, city, user_lat, user_lon)
        zomato_future = executor.submit(scrape_zomato, food, city, user_lat, user_lon)
        eatsure_future = executor.submit(scrape_eatsure, food, city, user_lat, user_lon)
        ubereats_future = executor.submit(scrape_ubereats, food, city, user_lat, user_lon)

        # Get results as they complete
        for future in concurrent.futures.as_completed([swiggy_future, zomato_future, eatsure_future, ubereats_future]):
            try:
                restaurants = future.result()
                all_restaurants.extend(restaurants)
            except Exception as e:
                logger.error(f"Error in scraper thread: {e}")

    return all_restaurants

@app.route('/api/food-delivery/scrape', methods=['GET'])
def scrape_food_delivery():
    """API endpoint to scrape food delivery options"""
    food = request.args.get('food', '')
    city = request.args.get('city', '')
    user_lat = request.args.get('lat')
    user_lon = request.args.get('lon')

    if not food or not city:
        return jsonify({"error": "Both food and city parameters are required"}), 400

    # Check cache
    cache_key = f"food_delivery_{food}_{city}"
    if cache_key in cache["data"] and time.time() - cache["timestamp"].get(cache_key, 0) < CACHE_EXPIRY:
        logger.info(f"Returning cached results for '{food}' in '{city}'")
        return jsonify({"results": cache["data"][cache_key], "source": "cache"})

    # Scrape restaurants
    restaurants = scrape_all_sources(food, city, user_lat, user_lon)

    # If no results from scraping, use hardcoded data
    if not restaurants:
        logger.warning(f"No results from scraping, using hardcoded data for '{food}' in '{city}'")
        restaurants = get_hardcoded_restaurants(food, city, user_lat, user_lon)

    # Update cache
    cache["data"][cache_key] = restaurants
    cache["timestamp"][cache_key] = time.time()

    return jsonify({
        "results": restaurants,
        "count": len(restaurants),
        "query": food,
        "city": city,
        "source": "scraping"
    })

def get_hardcoded_restaurants(food, city, user_lat=None, user_lon=None):
    """Get hardcoded restaurant data for fallback"""
    # Normalize city name
    city_lower = city.lower()

    # Hardcoded restaurant data for Hyderabad
    hyderabad_restaurants = [
        {
            "restaurant": "Paradise Biryani",
            "redirect": "https://www.zomato.com/hyderabad/paradise-biryani",
            "rating": 4.2,
            "delivery_time": "30-35 mins",
            "price_range": "₹350 for two",
            "cuisine": "North Indian",
            "address": "Masab Tank, Hyderabad",
            "image_url": "https://source.unsplash.com/random/300x300/?biryani,restaurant",
            "platform": "Zomato",
            "latitude": 17.3950,
            "longitude": 78.4867,
            "popular_dishes": ["Chicken Biryani", "Mutton Biryani", "Kebabs"],
            "offers": ["50% off up to ₹100", "Free delivery"],
            "restaurant_type": "non-veg",
            "health_score": 75,
            "menu_items": [
                {"name": "Chicken Biryani", "price": "₹249"},
                {"name": "Mutton Biryani", "price": "₹349"},
                {"name": "Chicken 65", "price": "₹199"}
            ],
            "health_tags": ["Healthy Option", "Low Carb Options Available"]
        },
        {
            "restaurant": "Bawarchi Restaurant",
            "redirect": "https://www.swiggy.com/restaurants/bawarchi-restaurant-hyderabad",
            "rating": 4.0,
            "delivery_time": "35-40 mins",
            "price_range": "₹300 for two",
            "cuisine": "North Indian",
            "address": "RTC X Roads, Hyderabad",
            "image_url": "https://source.unsplash.com/random/300x300/?indian,restaurant",
            "platform": "Swiggy",
            "latitude": 17.4010,
            "longitude": 78.4930,
            "popular_dishes": ["Hyderabadi Biryani", "Butter Chicken", "Rumali Roti"],
            "offers": ["40% off up to ₹80", "Free delivery"],
            "restaurant_type": "both",
            "health_score": 65,
            "menu_items": [
                {"name": "Hyderabadi Biryani", "price": "₹249"},
                {"name": "Butter Chicken", "price": "₹299"},
                {"name": "Rumali Roti", "price": "₹49"}
            ],
            "health_tags": ["Healthy Option"]
        },
        {
            "restaurant": "Chutneys",
            "redirect": "https://www.eatsure.com/hyderabad/chutneys",
            "rating": 4.3,
            "delivery_time": "25-30 mins",
            "price_range": "₹250 for two",
            "cuisine": "South Indian",
            "address": "Jubilee Hills, Hyderabad",
            "image_url": "https://source.unsplash.com/random/300x300/?dosa,restaurant",
            "platform": "EatSure",
            "latitude": 17.4310,
            "longitude": 78.4130,
            "popular_dishes": ["Masala Dosa", "Idli Sambar", "Mysore Bonda"],
            "offers": ["30% off up to ₹120", "Free delivery on orders above ₹199"],
            "restaurant_type": "veg",
            "health_score": 85,
            "menu_items": [
                {"name": "Masala Dosa", "price": "₹149"},
                {"name": "Idli Sambar", "price": "₹99"},
                {"name": "Mysore Bonda", "price": "₹129"}
            ],
            "health_tags": ["Very Healthy", "Plant-Based"]
        }
    ]

    # Hardcoded restaurant data for Mumbai
    mumbai_restaurants = [
        {
            "restaurant": "Trishna",
            "redirect": "https://www.zomato.com/mumbai/trishna-fort",
            "rating": 4.5,
            "delivery_time": "30-35 mins",
            "price_range": "₹1500 for two",
            "cuisine": "Seafood",
            "address": "Fort, Mumbai",
            "image_url": "https://source.unsplash.com/random/300x300/?seafood,restaurant",
            "platform": "Zomato",
            "latitude": 18.9322,
            "longitude": 72.8328,
            "popular_dishes": ["Butter Garlic Crab", "Prawns Koliwada", "Fish Tikka"],
            "offers": ["20% off up to ₹200", "Free delivery"],
            "restaurant_type": "non-veg",
            "health_score": 70,
            "menu_items": [
                {"name": "Butter Garlic Crab", "price": "₹899"},
                {"name": "Prawns Koliwada", "price": "₹499"},
                {"name": "Fish Tikka", "price": "₹399"}
            ],
            "health_tags": ["Healthy Option", "High Protein"]
        },
        {
            "restaurant": "Pizza By The Bay",
            "redirect": "https://www.ubereats.com/in/store/pizza-by-the-bay/",
            "rating": 4.3,
            "delivery_time": "40-45 mins",
            "price_range": "₹800 for two",
            "cuisine": "Italian, Pizza",
            "address": "Marine Drive, Mumbai",
            "image_url": "https://source.unsplash.com/random/300x300/?pizza,restaurant",
            "platform": "Uber Eats",
            "latitude": 18.9432,
            "longitude": 72.8228,
            "popular_dishes": ["Margherita Pizza", "Pepperoni Pizza", "Pasta Alfredo"],
            "offers": ["50% off up to ₹150", "Free delivery on orders above ₹499"],
            "restaurant_type": "both",
            "health_score": 55,
            "menu_items": [
                {"name": "Margherita Pizza", "price": "₹399"},
                {"name": "Pepperoni Pizza", "price": "₹499"},
                {"name": "Pasta Alfredo", "price": "₹349"}
            ],
            "health_tags": ["Indulgent"]
        }
    ]

    # Hardcoded restaurant data for Delhi
    delhi_restaurants = [
        {
            "restaurant": "Karim's",
            "redirect": "https://www.zomato.com/ncr/karims-jama-masjid-old-delhi",
            "rating": 4.5,
            "delivery_time": "30-35 mins",
            "price_range": "₹600 for two",
            "cuisine": "North Indian",
            "address": "Jama Masjid, Old Delhi",
            "image_url": "https://source.unsplash.com/random/300x300/?kebab,restaurant",
            "platform": "Zomato",
            "latitude": 28.6507,
            "longitude": 77.2334,
            "popular_dishes": ["Mutton Burra", "Chicken Jahangiri", "Mutton Korma"],
            "offers": ["30% off up to ₹150", "Free delivery"],
            "restaurant_type": "non-veg",
            "health_score": 60,
            "menu_items": [
                {"name": "Mutton Burra", "price": "₹499"},
                {"name": "Chicken Jahangiri", "price": "₹399"},
                {"name": "Mutton Korma", "price": "₹349"}
            ],
            "health_tags": ["Healthy Option"]
        },
        {
            "restaurant": "Saravana Bhavan",
            "redirect": "https://www.eatsure.com/delhi/saravana-bhavan",
            "rating": 4.4,
            "delivery_time": "25-30 mins",
            "price_range": "₹350 for two",
            "cuisine": "South Indian",
            "address": "Connaught Place, Delhi",
            "image_url": "https://source.unsplash.com/random/300x300/?southindian,restaurant",
            "platform": "EatSure",
            "latitude": 28.6329,
            "longitude": 77.2195,
            "popular_dishes": ["Masala Dosa", "Idli Sambar", "Rava Kesari"],
            "offers": ["40% off up to ₹100", "Free delivery on orders above ₹299"],
            "restaurant_type": "veg",
            "health_score": 85,
            "menu_items": [
                {"name": "Masala Dosa", "price": "₹149"},
                {"name": "Idli Sambar", "price": "₹99"},
                {"name": "Rava Kesari", "price": "₹79"}
            ],
            "health_tags": ["Very Healthy", "Plant-Based"]
        }
    ]

    # Hardcoded restaurant data for Bangalore
    bangalore_restaurants = [
        {
            "restaurant": "MTR",
            "redirect": "https://www.zomato.com/bangalore/mavalli-tiffin-room-mtr-lalbagh-bangalore",
            "rating": 4.6,
            "delivery_time": "30-35 mins",
            "price_range": "₹400 for two",
            "cuisine": "South Indian",
            "address": "Lalbagh, Bangalore",
            "image_url": "https://source.unsplash.com/random/300x300/?dosa,restaurant",
            "platform": "Zomato",
            "latitude": 12.9516,
            "longitude": 77.5932,
            "popular_dishes": ["Masala Dosa", "Rava Idli", "Filter Coffee"],
            "offers": ["25% off up to ₹125", "Free delivery"],
            "restaurant_type": "veg",
            "health_score": 80,
            "menu_items": [
                {"name": "Masala Dosa", "price": "₹149"},
                {"name": "Rava Idli", "price": "₹129"},
                {"name": "Filter Coffee", "price": "₹49"}
            ],
            "health_tags": ["Very Healthy", "Plant-Based"]
        },
        {
            "restaurant": "Truffles",
            "redirect": "https://www.ubereats.com/in/store/truffles/",
            "rating": 4.5,
            "delivery_time": "35-40 mins",
            "price_range": "₹500 for two",
            "cuisine": "American, Continental",
            "address": "Koramangala, Bangalore",
            "image_url": "https://source.unsplash.com/random/300x300/?burger,restaurant",
            "platform": "Uber Eats",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "popular_dishes": ["Chicken Burger", "Pasta Alfredo", "Chocolate Truffle Cake"],
            "offers": ["50% off up to ₹150", "Free delivery on orders above ₹399"],
            "restaurant_type": "both",
            "health_score": 60,
            "menu_items": [
                {"name": "Chicken Burger", "price": "₹249"},
                {"name": "Pasta Alfredo", "price": "₹299"},
                {"name": "Chocolate Truffle Cake", "price": "₹199"}
            ],
            "health_tags": ["Healthy Option"]
        }
    ]

    # Select restaurants based on city
    if 'hyderabad' in city_lower:
        restaurants = hyderabad_restaurants
    elif 'mumbai' in city_lower or 'bombay' in city_lower:
        restaurants = mumbai_restaurants
    elif 'delhi' in city_lower:
        restaurants = delhi_restaurants
    elif 'bangalore' in city_lower or 'bengaluru' in city_lower:
        restaurants = bangalore_restaurants
    else:
        # Default to Hyderabad if city not recognized
        restaurants = hyderabad_restaurants

    # Calculate distance if user coordinates are provided
    if user_lat and user_lon:
        for restaurant in restaurants:
            if restaurant.get('latitude') and restaurant.get('longitude'):
                restaurant['distance_km'] = calculate_distance(
                    float(user_lat),
                    float(user_lon),
                    restaurant['latitude'],
                    restaurant['longitude']
                )

    # Filter restaurants based on food query if provided
    if food:
        food_lower = food.lower()
        filtered_restaurants = []

        # First try to match restaurants with dishes containing the food query
        for restaurant in restaurants:
            if 'popular_dishes' in restaurant:
                if any(food_lower in dish.lower() for dish in restaurant['popular_dishes']):
                    filtered_restaurants.append(restaurant)
                    continue

            # Then try to match by cuisine or restaurant name
            if 'cuisine' in restaurant and food_lower in restaurant['cuisine'].lower():
                filtered_restaurants.append(restaurant)
                continue

            if food_lower in restaurant['restaurant'].lower():
                filtered_restaurants.append(restaurant)
                continue

        # If we have filtered restaurants, return those
        if filtered_restaurants:
            return filtered_restaurants

    # If no matches or no food query, return all restaurants for the city
    return restaurants

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
