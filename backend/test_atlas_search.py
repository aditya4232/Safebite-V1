import requests
import json
import sys
import time

# Base URL for the API (local or production)
BASE_URL = "http://localhost:10000"  # Change to your Render URL when deployed

def test_search(query):
    """Test the search endpoint with a query"""
    print(f"\n🔍 Testing search for '{query}'...")
    response = requests.get(f"{BASE_URL}/search?q={query}")

    if response.status_code == 200:
        results = response.json()
        print(f"✅ Search successful - Found {len(results)} results")

        if len(results) > 0:
            # Print the first 3 results with scores
            print("\nTop results:")
            for i, result in enumerate(results[:3], 1):
                name = result.get("product", "Unknown")
                brand = result.get("brand", "Unknown")
                category = result.get("category", "Unknown")
                score = result.get("score", "N/A")
                print(f"{i}. {name} (Brand: {brand}, Category: {category}) - Score: {score}")

        return results
    elif response.status_code == 404:
        print(f"⚠️ No results found for '{query}'")
        print(f"Response: {response.text}")
        return []
    else:
        print(f"❌ Search failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return []

def test_product(product_id):
    """Test the product endpoint with a product ID"""
    print(f"\n📦 Testing product details for ID '{product_id}'...")
    response = requests.get(f"{BASE_URL}/product/{product_id}")

    if response.status_code == 200:
        product = response.json()
        print(f"✅ Product details retrieved successfully")
        print(f"Product: {product.get('product', 'Unknown')}")
        print(f"Brand: {product.get('brand', 'Unknown')}")
        print(f"Category: {product.get('category', 'Unknown')}")
        print(f"Price: ₹{product.get('sale_price', 'N/A')}")
        print(f"Rating: {product.get('rating', 'N/A')}/5")
        if product.get('description'):
            print(f"Description: {product.get('description')}")
        return product
    else:
        print(f"❌ Failed to get product details with status code {response.status_code}")
        print(f"Response: {response.text}")
        return None

def run_search_tests():
    """Run a series of search tests with different queries"""
    print("=" * 60)
    print("🔍 TESTING ATLAS SEARCH FUNCTIONALITY")
    print("=" * 60)

    # Test exact product names
    test_search("Apple")
    test_search("Chocolate")
    test_search("Milk")

    # Test partial matches
    test_search("App")  # Should match Apple products
    test_search("Choc")  # Should match Chocolate products

    # Test with typos (fuzzy matching)
    test_search("Aple")  # Misspelled Apple
    test_search("Choclate")  # Misspelled Chocolate

    # Test with brand names
    test_search("Nestle")
    test_search("Amul")

    # Test with categories
    test_search("Dairy")
    test_search("Snacks")

    # Test with a product ID from search results
    results = test_search("Chocolate")
    if results and len(results) > 0:
        product_id = results[0]["_id"]
        test_product(product_id)

    print("\n" + "=" * 60)
    print("🏁 ATLAS SEARCH TESTING COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    # Check if the Flask server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print(f"✅ Connected to API at {BASE_URL}")
            print(f"API Status: {response.json().get('status', 'unknown')}")
            print(f"API Version: {response.json().get('message', 'unknown')}")

            # Run the search tests
            run_search_tests()
        else:
            print(f"❌ API returned status code {response.status_code}")
            print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Failed to connect to API at {BASE_URL}")
        print("Make sure the Flask server is running and the URL is correct.")
        sys.exit(1)
