from pymongo import MongoClient
import requests
import json

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/"
DB_NAME = "safebite"
COLLECTION_NAME = "Grocery Products"

# Render backend URL
RENDER_URL = "https://safebite-backend.onrender.com"

def search_mongo_direct(query, limit=5):
    """Search directly in MongoDB using regex"""
    print(f"\n--- Direct MongoDB Search for '{query}' ---")

    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # Count total documents
        total_count = collection.count_documents({})
        print(f"Total documents in collection: {total_count}")

        # Build search query
        search_query = {
            "$or": [
                {"product": {"$regex": query, "$options": "i"}},
                {"brand": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}},
                {"sub_category": {"$regex": query, "$options": "i"}}
            ]
        }

        # Execute search
        results = list(collection.find(search_query).limit(limit))
        print(f"Found {len(results)} results with regex search")

        # Display results
        for i, result in enumerate(results):
            name = result.get('product', 'Unknown')
            brand = result.get('brand', 'Unknown brand')
            category = result.get('category', 'Unknown category')
            print(f"  {i+1}. {name} - {brand} ({category})")

        # Try Atlas Search if available
        try:
            print("\nTrying Atlas Search...")
            pipeline = [
                {
                    "$search": {
                        "index": "default",
                        "text": {
                            "query": query,
                            "path": {
                                "wildcard": "*"
                            }
                        }
                    }
                },
                {"$limit": limit}
            ]

            atlas_results = list(collection.aggregate(pipeline))
            print(f"Found {len(atlas_results)} results with Atlas Search")

            # Display results
            for i, result in enumerate(atlas_results):
                name = result.get('product', 'Unknown')
                brand = result.get('brand', 'Unknown brand')
                category = result.get('category', 'Unknown category')
                print(f"  {i+1}. {name} - {brand} ({category})")

        except Exception as e:
            print(f"Atlas Search error: {e}")

        return True
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return False

def search_render_backend(query, limit=5):
    """Search using the Render backend"""
    print(f"\n--- Render Backend Search for '{query}' ---")

    try:
        # First check if the API is running
        response = requests.get(f"{RENDER_URL}/")
        if response.status_code != 200:
            print(f"Render backend not available: {response.status_code}")
            return False

        print("Render backend is running")

        # Try different search endpoints
        endpoints = [
            f"/search?q={query}",
            f"/api/search?q={query}",
            f"/api/dataset/search?query={query}"
        ]

        for endpoint in endpoints:
            url = f"{RENDER_URL}{endpoint}"
            print(f"\nTrying endpoint: {url}")

            try:
                response = requests.get(url)
                print(f"Status: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    print(f"Found {len(results)} results")

                    # Display results
                    for i, result in enumerate(results[:limit]):
                        name = result.get('name', result.get('product', 'Unknown'))
                        brand = result.get('brand', 'Unknown brand')
                        category = result.get('category', 'Unknown category')
                        print(f"  {i+1}. {name} - {brand} ({category})")

                    if len(results) > 0:
                        return True
                else:
                    print(f"Search failed: {response.text}")
            except Exception as e:
                print(f"Error with endpoint {endpoint}: {e}")

        return False
    except Exception as e:
        print(f"Render backend error: {e}")
        return False

def main():
    """Main function to test both MongoDB and Render backend"""
    search_terms = ["milk", "bread", "apple", "chicken", "rice", "cereal"]

    # Test MongoDB direct connection
    mongo_success = False
    for term in search_terms:
        if search_mongo_direct(term):
            mongo_success = True
            break

    if not mongo_success:
        print("\n❌ Could not connect to MongoDB or no results found")
    else:
        print("\n✅ MongoDB connection and search successful")

    # Test Render backend
    render_success = False
    for term in search_terms:
        if search_render_backend(term):
            render_success = True
            break

    if not render_success:
        print("\n❌ Could not connect to Render backend or no results found")
    else:
        print("\n✅ Render backend search successful")

if __name__ == "__main__":
    main()
