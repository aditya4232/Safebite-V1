import requests
import json

def test_search(base_url="http://localhost:10000"):
    """Test the search functionality of the grocery API"""
    print(f"Testing search functionality at {base_url}")
    
    # List of common grocery items to search for
    search_terms = ["milk", "bread", "apple", "chicken", "rice", "cereal"]
    
    for term in search_terms:
        print(f"\nSearching for '{term}'...")
        try:
            # Test the search endpoint
            response = requests.get(f"{base_url}/search?q={term}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                result_count = data.get('count', 0)
                print(f"Found {result_count} results")
                
                # Display the first 3 results
                results = data.get('results', [])
                for i, result in enumerate(results[:3]):
                    name = result.get('name', result.get('product', 'Unknown'))
                    brand = result.get('brand', 'Unknown brand')
                    category = result.get('category', 'Unknown category')
                    print(f"  {i+1}. {name} - {brand} ({category})")
                
                if result_count > 0:
                    print(f"✅ Search for '{term}' successful")
                else:
                    print(f"⚠️ No results found for '{term}'")
            else:
                print(f"❌ Search failed: {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\nSearch Testing Complete!")

if __name__ == "__main__":
    # Test with local server
    test_search()
    
    # Uncomment to test with Render backend
    # test_search("https://safebite-backend.onrender.com")
