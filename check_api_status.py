import requests
import time

# Render API URL
API_URL = "https://safebite-backend.onrender.com"

def check_api_status():
    print(f"Checking API status at {API_URL}...")
    
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response: {data}")
                print("✅ API is running!")
                return True
            except Exception as e:
                print(f"Error parsing JSON: {e}")
                print(f"Raw response: {response.text}")
        else:
            print(f"❌ API returned non-200 status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")
    
    return False

if __name__ == "__main__":
    check_api_status()
