import pymongo
import json
from bson import ObjectId
import sys

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"

# Custom JSON encoder to handle ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

def test_mongodb_connection():
    print(f"Testing MongoDB connection to: {MONGO_URI}")
    
    try:
        # Connect to MongoDB Atlas
        client = pymongo.MongoClient(MONGO_URI)
        
        # Check connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database and collections
        db = client.safebite
        collections = db.list_collection_names()
        print(f"📚 Collections in database: {collections}")
        
        # Check products collection
        if 'products' in collections:
            products_count = db.products.count_documents({})
            print(f"🔢 Number of documents in products collection: {products_count}")
            
            # Get a sample product
            sample_product = db.products.find_one()
            if sample_product:
                print(f"📝 Sample product: {json.dumps(sample_product, cls=JSONEncoder, indent=2)}")
        
        # Check Grocery Products collection
        if 'Grocery Products' in collections:
            grocery_count = db['Grocery Products'].count_documents({})
            print(f"🔢 Number of documents in Grocery Products collection: {grocery_count}")
            
            # Get a sample grocery product
            sample_grocery = db['Grocery Products'].find_one()
            if sample_grocery:
                print(f"📝 Sample grocery product: {json.dumps(sample_grocery, cls=JSONEncoder, indent=2)}")
        
        # Test text search
        if 'products' in collections:
            # Use existing text index
            search_results = list(db.products.find({"$text": {"$search": "milk"}}).limit(5))
            print(f"🔍 Text search for 'milk' found {len(search_results)} results")
            if search_results:
                print(f"📝 Sample search result: {json.dumps(search_results[0], cls=JSONEncoder, indent=2)}")
        
        return True
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        return False
    finally:
        # Close the connection
        if 'client' in locals():
            client.close()
            print("🔒 MongoDB connection closed")

if __name__ == "__main__":
    success = test_mongodb_connection()
    sys.exit(0 if success else 1)
