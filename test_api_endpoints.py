import requests
import json
import time
import sys

# Render API URL
API_URL = "https://safebite-backend.onrender.com"

def test_api_endpoints():
    print("Testing SafeBite Backend API on Render...")
    print(f"API URL: {API_URL}")
    print("Waiting for deployment to complete...")
    
    # Wait for deployment to complete (max 5 minutes)
    max_retries = 30
    retry_interval = 10  # seconds
    
    for i in range(max_retries):
        try:
            # Test status endpoint
            response = requests.get(f"{API_URL}/status", timeout=10)
            if response.status_code == 200:
                print(f"✅ Deployment complete! Status endpoint is responding.")
                break
        except Exception:
            pass
        
        print(f"Waiting... ({i+1}/{max_retries})")
        time.sleep(retry_interval)
    else:
        print("❌ Deployment timed out. Please check Render dashboard.")
        sys.exit(1)
    
    # Test all endpoints
    endpoints = [
        {"name": "Status", "url": "/status"},
        {"name": "Products", "url": "/api/products"},
        {"name": "Products with Search", "url": "/api/products?search=milk"},
        {"name": "Products with Pagination", "url": "/api/products?page=2&limit=10"},
        {"name": "Grocery Products", "url": "/api/groceryProducts"},
        {"name": "Grocery Products with Search", "url": "/api/groceryProducts?search=oil"},
        {"name": "Legacy Products", "url": "/products"},
        {"name": "Legacy Grocery Products", "url": "/grocery-products"}
    ]
    
    results = []
    
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"{API_URL}{endpoint['url']}", timeout=30)
            end_time = time.time()
            
            result = {
                "name": endpoint["name"],
                "url": endpoint["url"],
                "status_code": response.status_code,
                "response_time": round((end_time - start_time) * 1000, 2),  # ms
                "success": response.status_code == 200
            }
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    result["items_count"] = len(data)
                elif isinstance(data, dict) and "products" in data:
                    result["items_count"] = len(data["products"])
                    result["total"] = data.get("total")
                    result["page"] = data.get("page")
                    result["total_pages"] = data.get("totalPages")
            
            results.append(result)
            
        except Exception as e:
            results.append({
                "name": endpoint["name"],
                "url": endpoint["url"],
                "status_code": "Error",
                "error": str(e),
                "success": False
            })
    
    # Print results
    print("\n=== API Endpoint Test Results ===")
    
    success_count = sum(1 for r in results if r["success"])
    print(f"\nSummary: {success_count}/{len(results)} endpoints working\n")
    
    for result in results:
        status = "✅" if result["success"] else "❌"
        print(f"{status} {result['name']} ({result['url']})")
        
        if result["success"]:
            print(f"   Status: {result['status_code']}, Response Time: {result['response_time']} ms")
            if "items_count" in result:
                print(f"   Items: {result['items_count']}")
            if "total" in result:
                print(f"   Total: {result['total']}, Page: {result['page']}/{result['total_pages']}")
        else:
            if "status_code" in result and result["status_code"] != "Error":
                print(f"   Status: {result['status_code']}")
            if "error" in result:
                print(f"   Error: {result['error']}")
        
        print()
    
    # Final verdict
    if success_count == len(results):
        print("🎉 All API endpoints are working correctly!")
    else:
        print(f"⚠️ {len(results) - success_count} endpoint(s) are not working correctly.")
    
    return success_count == len(results)

if __name__ == "__main__":
    test_api_endpoints()
