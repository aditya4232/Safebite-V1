import requests
import json

# Render API URL
API_URL = "https://safebite-backend.onrender.com"

def test_api():
    print("Testing SafeBite Backend API on Render...")
    
    # Test status endpoint
    try:
        response = requests.get(f"{API_URL}/status")
        print(f"\n1. Status Endpoint (/status):")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test products endpoint
    try:
        response = requests.get(f"{API_URL}/api/products")
        print(f"\n2. Products Endpoint (/api/products):")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Total Products: {data.get('total', 'N/A')}")
        print(f"   Page: {data.get('page', 'N/A')}")
        print(f"   Total Pages: {data.get('totalPages', 'N/A')}")
        print(f"   Products Count: {len(data.get('products', []))}")
        if data.get('products'):
            print(f"   Sample Product: {json.dumps(data['products'][0], indent=2)[:500]}...")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test grocery products endpoint
    try:
        response = requests.get(f"{API_URL}/api/groceryProducts")
        print(f"\n3. Grocery Products Endpoint (/api/groceryProducts):")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Total Products: {data.get('total', 'N/A')}")
        print(f"   Page: {data.get('page', 'N/A')}")
        print(f"   Total Pages: {data.get('totalPages', 'N/A')}")
        print(f"   Products Count: {len(data.get('products', []))}")
        if data.get('products'):
            print(f"   Sample Product: {json.dumps(data['products'][0], indent=2)[:500]}...")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test search functionality
    try:
        search_term = "milk"
        response = requests.get(f"{API_URL}/api/products?search={search_term}")
        print(f"\n4. Search Products Endpoint (/api/products?search={search_term}):")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Total Products: {data.get('total', 'N/A')}")
        print(f"   Products Count: {len(data.get('products', []))}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\nAPI Testing Complete!")

if __name__ == "__main__":
    test_api()
