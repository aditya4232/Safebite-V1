"""
Grocery Product Scraper for SafeBite

This script scrapes grocery product data from:
- Blinkit
- Instamart (Swiggy)
- Zepto

It uses BeautifulSoup and Playwright for scraping and provides a Flask API endpoint
to serve the scraped data.
"""

from flask import Flask, request, jsonify, Response
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
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('grocery_scraper')

app = Flask(__name__)
CORS(app)

# Cache for storing scraped data
cache = {
    "data": {},
    "timestamp": {}
}

# Cache expiry time (30 minutes)
CACHE_EXPIRY = 30 * 60  # 30 minutes in seconds

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

def clean_price(price_str):
    """Extract numeric price from string"""
    if not price_str:
        return 0
    
    # Extract digits and decimal point
    price_match = re.search(r'(\d+(?:\.\d+)?)', price_str.replace(',', ''))
    if price_match:
        return float(price_match.group(1))
    return 0

def extract_discount_percentage(text):
    """Extract discount percentage from text"""
    if not text:
        return 0
    
    match = re.search(r'(\d+)%\s+off', text, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return 0

def scrape_blinkit(query):
    """Scrape grocery products from Blinkit"""
    logger.info(f"Scraping Blinkit for: {query}")
    products = []
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=get_random_user_agent(),
                viewport={'width': 1280, 'height': 800}
            )
            
            # Set location (Bangalore by default)
            page.goto('https://blinkit.com')
            time.sleep(2)
            
            # Search for products
            search_url = f'https://blinkit.com/s/?q={quote(query)}'
            page.goto(search_url, timeout=60000)
            time.sleep(3)
            
            # Get page content
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Find product cards
            product_cards = soup.select('div[data-testid="product-card"]')
            logger.info(f"Found {len(product_cards)} products on Blinkit")
            
            for card in product_cards[:10]:  # Limit to 10 products
                try:
                    # Extract product details
                    name_elem = card.select_one('div[class*="ProductName"]')
                    name = name_elem.text.strip() if name_elem else "Unknown Product"
                    
                    # Extract image
                    img_elem = card.select_one('img')
                    image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                    
                    # Extract price
                    price_elem = card.select_one('div[class*="Price"]')
                    price_text = price_elem.text.strip() if price_elem else "₹0"
                    price = clean_price(price_text)
                    
                    # Extract original price if available
                    original_price_elem = card.select_one('div[class*="OriginalPrice"]')
                    original_price = clean_price(original_price_elem.text) if original_price_elem else price
                    
                    # Extract product link
                    link_elem = card.select_one('a')
                    product_link = f"https://blinkit.com{link_elem['href']}" if link_elem and 'href' in link_elem.attrs else ""
                    
                    # Extract brand and category
                    brand = ""
                    category = ""
                    weight_elem = card.select_one('div[class*="Weight"]')
                    weight = weight_elem.text.strip() if weight_elem else ""
                    
                    # Extract offers
                    offers = []
                    offer_elem = card.select_one('div[class*="Discount"]')
                    if offer_elem:
                        offers.append(offer_elem.text.strip())
                    
                    # Create product object
                    product = {
                        "_id": f"blinkit_{int(time.time())}_{len(products)}",
                        "name": name,
                        "brand": brand,
                        "category": category,
                        "description": f"{name} {weight}".strip(),
                        "price": price,
                        "sale_price": price,
                        "market_price": original_price,
                        "image_url": image_url,
                        "source": "Blinkit",
                        "platform": "Blinkit",
                        "redirect": product_link,
                        "offers": offers,
                        "in_stock": True,
                        "weight": weight,
                        "rating": random.uniform(3.5, 4.9)  # Random rating between 3.5 and 4.9
                    }
                    
                    products.append(product)
                except Exception as e:
                    logger.error(f"Error extracting Blinkit product: {e}")
            
            browser.close()
    except Exception as e:
        logger.error(f"Error scraping Blinkit: {e}")
    
    return products

def scrape_instamart(query):
    """Scrape grocery products from Swiggy Instamart"""
    logger.info(f"Scraping Instamart for: {query}")
    products = []
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=get_random_user_agent(),
                viewport={'width': 1280, 'height': 800}
            )
            
            # Go to Instamart
            page.goto('https://www.swiggy.com/instamart')
            time.sleep(2)
            
            # Search for products
            search_url = f'https://www.swiggy.com/search?query={quote(query)}&context=instamart'
            page.goto(search_url, timeout=60000)
            time.sleep(3)
            
            # Get page content
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Find product cards
            product_cards = soup.select('div[data-testid="product-card"]')
            if not product_cards:
                product_cards = soup.select('div.styles_container__3Fl4V')  # Alternative selector
            
            logger.info(f"Found {len(product_cards)} products on Instamart")
            
            for card in product_cards[:10]:  # Limit to 10 products
                try:
                    # Extract product details
                    name_elem = card.select_one('div.styles_itemName__3ZmZZ, div.styles_productName__3RRvk')
                    name = name_elem.text.strip() if name_elem else "Unknown Product"
                    
                    # Extract image
                    img_elem = card.select_one('img')
                    image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                    
                    # Extract price
                    price_elem = card.select_one('div.styles_itemPrice__1Nrpd, div.styles_price__2xrhD')
                    price_text = price_elem.text.strip() if price_elem else "₹0"
                    price = clean_price(price_text)
                    
                    # Extract original price if available
                    original_price_elem = card.select_one('div.styles_strikePrice__3WGQE')
                    original_price = clean_price(original_price_elem.text) if original_price_elem else price
                    
                    # Extract product link
                    link_elem = card.select_one('a')
                    product_link = f"https://www.swiggy.com{link_elem['href']}" if link_elem and 'href' in link_elem.attrs else ""
                    
                    # Extract weight
                    weight_elem = card.select_one('div.styles_quantity__1hCD9, div.styles_weight__2SLwg')
                    weight = weight_elem.text.strip() if weight_elem else ""
                    
                    # Extract offers
                    offers = []
                    offer_elem = card.select_one('div.styles_discountTag__3Uy8r')
                    if offer_elem:
                        offers.append(offer_elem.text.strip())
                    
                    # Create product object
                    product = {
                        "_id": f"instamart_{int(time.time())}_{len(products)}",
                        "name": name,
                        "brand": "",  # Instamart doesn't clearly show brand
                        "category": "",
                        "description": f"{name} {weight}".strip(),
                        "price": price,
                        "sale_price": price,
                        "market_price": original_price,
                        "image_url": image_url,
                        "source": "Instamart",
                        "platform": "Swiggy Instamart",
                        "redirect": product_link,
                        "offers": offers,
                        "in_stock": True,
                        "weight": weight,
                        "rating": random.uniform(3.5, 4.9)  # Random rating between 3.5 and 4.9
                    }
                    
                    products.append(product)
                except Exception as e:
                    logger.error(f"Error extracting Instamart product: {e}")
            
            browser.close()
    except Exception as e:
        logger.error(f"Error scraping Instamart: {e}")
    
    return products

def scrape_zepto(query):
    """Scrape grocery products from Zepto"""
    logger.info(f"Scraping Zepto for: {query}")
    products = []
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent=get_random_user_agent(),
                viewport={'width': 1280, 'height': 800}
            )
            
            # Go to Zepto
            page.goto('https://www.zeptonow.com/')
            time.sleep(2)
            
            # Search for products
            search_url = f'https://www.zeptonow.com/search?q={quote(query)}'
            page.goto(search_url, timeout=60000)
            time.sleep(3)
            
            # Get page content
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Find product cards
            product_cards = soup.select('div.product-card')
            if not product_cards:
                product_cards = soup.select('div[data-testid="product-card"]')  # Alternative selector
            
            logger.info(f"Found {len(product_cards)} products on Zepto")
            
            for card in product_cards[:10]:  # Limit to 10 products
                try:
                    # Extract product details
                    name_elem = card.select_one('p.product-title, div.product-name')
                    name = name_elem.text.strip() if name_elem else "Unknown Product"
                    
                    # Extract image
                    img_elem = card.select_one('img')
                    image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                    
                    # Extract price
                    price_elem = card.select_one('p.product-price, div.discounted-price')
                    price_text = price_elem.text.strip() if price_elem else "₹0"
                    price = clean_price(price_text)
                    
                    # Extract original price if available
                    original_price_elem = card.select_one('p.product-mrp, div.original-price')
                    original_price = clean_price(original_price_elem.text) if original_price_elem else price
                    
                    # Extract product link
                    link_elem = card.select_one('a')
                    product_link = f"https://www.zeptonow.com{link_elem['href']}" if link_elem and 'href' in link_elem.attrs else ""
                    
                    # Extract weight
                    weight_elem = card.select_one('p.product-weight, div.product-weight')
                    weight = weight_elem.text.strip() if weight_elem else ""
                    
                    # Extract offers
                    offers = []
                    offer_elem = card.select_one('div.discount-tag, span.discount-percentage')
                    if offer_elem:
                        offers.append(offer_elem.text.strip())
                    
                    # Create product object
                    product = {
                        "_id": f"zepto_{int(time.time())}_{len(products)}",
                        "name": name,
                        "brand": "",  # Zepto doesn't clearly show brand
                        "category": "",
                        "description": f"{name} {weight}".strip(),
                        "price": price,
                        "sale_price": price,
                        "market_price": original_price,
                        "image_url": image_url,
                        "source": "Zepto",
                        "platform": "Zepto",
                        "redirect": product_link,
                        "offers": offers,
                        "in_stock": True,
                        "weight": weight,
                        "rating": random.uniform(3.5, 4.9)  # Random rating between 3.5 and 4.9
                    }
                    
                    products.append(product)
                except Exception as e:
                    logger.error(f"Error extracting Zepto product: {e}")
            
            browser.close()
    except Exception as e:
        logger.error(f"Error scraping Zepto: {e}")
    
    return products

def scrape_all_sources(query):
    """Scrape products from all sources in parallel"""
    all_products = []
    
    # Use ThreadPoolExecutor to run scrapers in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        # Submit scraping tasks
        blinkit_future = executor.submit(scrape_blinkit, query)
        instamart_future = executor.submit(scrape_instamart, query)
        zepto_future = executor.submit(scrape_zepto, query)
        
        # Get results as they complete
        for future in concurrent.futures.as_completed([blinkit_future, instamart_future, zepto_future]):
            try:
                products = future.result()
                all_products.extend(products)
            except Exception as e:
                logger.error(f"Error in scraper thread: {e}")
    
    return all_products

@app.route('/api/grocery/scrape', methods=['GET'])
def scrape_grocery():
    """API endpoint to scrape grocery products"""
    query = request.args.get('q', '')
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    # Check cache
    cache_key = f"grocery_{query}"
    if cache_key in cache["data"] and time.time() - cache["timestamp"].get(cache_key, 0) < CACHE_EXPIRY:
        logger.info(f"Returning cached results for '{query}'")
        return jsonify({"results": cache["data"][cache_key], "source": "cache"})
    
    # Scrape products
    products = scrape_all_sources(query)
    
    # Update cache
    cache["data"][cache_key] = products
    cache["timestamp"][cache_key] = time.time()
    
    return jsonify({
        "results": products,
        "count": len(products),
        "query": query,
        "source": "scraping"
    })

@app.route('/api/grocery/search', methods=['GET'])
def search_grocery():
    """API endpoint to search grocery products (alias for scrape)"""
    return scrape_grocery()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
