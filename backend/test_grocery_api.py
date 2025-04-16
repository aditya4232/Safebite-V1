import requests
import json
import time
import sys

def test_grocery_api(base_url="http://localhost:10000"):
    """Test the grocery API endpoints"""
    print(f"Testing Grocery API at {base_url}")
    
    # Test root endpoint
    try:
        print("\n1. Testing root endpoint...")
        response = requests.get(f"{base_url}/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Error testing root endpoint: {e}")
    
    # Test grocery products endpoint
    try:
        print("\n2. Testing grocery products endpoint...")
        response = requests.get(f"{base_url}/grocery")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data['products'])} products (total: {data['total']})")
            if data['products']:
                print(f"Sample product: {json.dumps(data['products'][0], indent=2)}")
            print("✅ Grocery products endpoint working")
        else:
            print(f"❌ Grocery products endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Error testing grocery products endpoint: {e}")
    
    # Test search endpoint
    try:
        print("\n3. Testing search endpoint...")
        query = "milk"
        response = requests.get(f"{base_url}/search?q={query}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data['results'])} results for '{query}'")
            if data['results']:
                print(f"Sample result: {json.dumps(data['results'][0], indent=2)}")
            print("✅ Search endpoint working")
        else:
            print(f"❌ Search endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Error testing search endpoint: {e}")
    
    # Test product by ID endpoint
    try:
        print("\n4. Testing product by ID endpoint...")
        # First get a product ID from the products endpoint
        response = requests.get(f"{base_url}/grocery")
        if response.status_code == 200:
            data = response.json()
            if data['products']:
                product_id = data['products'][0]['_id']
                print(f"Testing with product ID: {product_id}")
                
                # Now test the product by ID endpoint
                response = requests.get(f"{base_url}/grocery/{product_id}")
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    product = response.json()
                    print(f"Product: {json.dumps(product, indent=2)}")
                    print("✅ Product by ID endpoint working")
                else:
                    print(f"❌ Product by ID endpoint failed: {response.text}")
            else:
                print("❌ No products found to test product by ID endpoint")
        else:
            print(f"❌ Could not get product ID: {response.text}")
    except Exception as e:
        print(f"❌ Error testing product by ID endpoint: {e}")
    
    print("\nAPI Testing Complete!")

if __name__ == "__main__":
    # Use command line argument for base URL if provided
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:10000"
    test_grocery_api(base_url)
