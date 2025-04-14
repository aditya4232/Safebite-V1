from pymongo import MongoClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_mongodb_connection():
    """Test MongoDB connection and print collection info"""
    try:
        # MongoDB Atlas URI
        mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"
        
        # Connect with a timeout
        logger.info("Connecting to MongoDB...")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.admin.command('ping')
        logger.info("MongoDB connection successful!")
        
        # Get database
        db = client["safebite"]
        
        # List all collections
        logger.info("Available collections:")
        for collection_name in db.list_collection_names():
            logger.info(f"- {collection_name}")
            # Count documents in collection
            count = db[collection_name].count_documents({})
            logger.info(f"  Documents: {count}")
            
            # Show sample document structure
            if count > 0:
                sample = db[collection_name].find_one()
                logger.info(f"  Sample document keys: {list(sample.keys())}")
        
        return True
    except Exception as e:
        logger.error(f"MongoDB connection error: {e}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
