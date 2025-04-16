import requests
import json

def test_api(base_url="http://localhost:10000"):
    """Test the grocery API endpoints"""
    print(f"Testing API at {base_url}")
    
    # Test root endpoint
    print("\n1. Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test grocery products endpoint
    print("\n2. Testing grocery products endpoint...")
    try:
        response = requests.get(f"{base_url}/grocery")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data['products'])} products (total: {data['total']})")
            if data['products']:
                print(f"First product: {data['products'][0]['name']}")
            print("✅ Grocery products endpoint working")
        else:
            print(f"❌ Grocery products endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test search endpoint
    print("\n3. Testing search endpoint...")
    try:
        query = "milk"
        response = requests.get(f"{base_url}/search?q={query}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data['count']} results for '{query}'")
            if data['results']:
                print(f"First result: {data['results'][0]['name']}")
            print("✅ Search endpoint working")
        else:
            print(f"❌ Search endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\nAPI Testing Complete!")

if __name__ == "__main__":
    test_api()
