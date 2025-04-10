import pymongo
import json
from bson import ObjectId

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"

# Custom JSON encoder to handle ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

def test_connection():
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
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
    finally:
        # Close the connection
        if 'client' in locals():
            client.close()
            print("🔒 MongoDB connection closed")

if __name__ == "__main__":
    test_connection()
