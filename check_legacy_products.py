import requests
import json

# Render API URL
API_URL = "https://safebite-backend.onrender.com"

def check_legacy_products():
    print(f"Checking legacy products endpoint at {API_URL}/products...")
    
    try:
        response = requests.get(f"{API_URL}/products", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                
                if isinstance(data, list):
                    products_count = len(data)
                    
                    print(f"✅ Legacy products endpoint is working!")
                    print(f"Products in response: {products_count}")
                    
                    if products_count > 0:
                        print("\nSample product:")
                        sample = data[0]
                        print(json.dumps(sample, indent=2)[:500] + "...")
                    
                    return True
                else:
                    print("❌ Response is not a list of products")
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
    check_legacy_products()
