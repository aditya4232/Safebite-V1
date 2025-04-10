import requests
import json

# Render API URL
API_URL = "https://safebite-backend.onrender.com"

def check_products_api():
    print(f"Checking products API at {API_URL}/api/products...")
    
    try:
        response = requests.get(f"{API_URL}/api/products", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                
                if "products" in data:
                    products_count = len(data["products"])
                    total = data.get("total", "N/A")
                    page = data.get("page", "N/A")
                    total_pages = data.get("totalPages", "N/A")
                    
                    print(f"✅ Products API is working!")
                    print(f"Products in response: {products_count}")
                    print(f"Total products: {total}")
                    print(f"Page: {page}/{total_pages}")
                    
                    if products_count > 0:
                        print("\nSample product:")
                        sample = data["products"][0]
                        print(json.dumps(sample, indent=2)[:500] + "...")
                    
                    return True
                else:
                    print("❌ Response does not contain 'products' field")
                    print(f"Response: {data}")
            except Exception as e:
                print(f"Error parsing JSON: {e}")
                print(f"Raw response: {response.text[:500]}")
        else:
            print(f"❌ API returned non-200 status code: {response.status_code}")
            print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")
    
    return False

if __name__ == "__main__":
    check_products_api()
