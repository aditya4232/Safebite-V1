from pymongo import MongoClient
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_atlas_search(query="apple"):
    """Test MongoDB Atlas Search and print results"""
    try:
        # MongoDB Atlas URI
        mongo_uri = "mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite"
        
        # Connect with a timeout
        logger.info(f"Connecting to MongoDB to search for '{query}'...")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.admin.command('ping')
        logger.info("MongoDB connection successful!")
        
        # Get database
        db = client["safebite"]
        
        # Get collections
        grocery_collection = db["Grocery Products"]
        products_collection = db["products"]
        
        # Test Atlas Search on grocery collection
        logger.info("Testing Atlas Search on grocery collection...")
        try:
            # Use Atlas Search with wildcard path
            pipeline = [
                {
                    "$search": {
                        "index": "default",
                        "text": {
                            "query": query,
                            "path": {
                                "wildcard": "*"
                            },
                            "fuzzy": {
                                "maxEdits": 2
                            }
                        }
                    }
                },
                # Limit results
                {"$limit": 5}
            ]
            
            grocery_results = list(grocery_collection.aggregate(pipeline))
            logger.info(f"Found {len(grocery_results)} grocery results with Atlas Search")
            
            if grocery_results:
                logger.info("Sample grocery result:")
                # Convert ObjectId to string for display
                sample = grocery_results[0].copy()
                sample["_id"] = str(sample["_id"])
                logger.info(json.dumps(sample, indent=2))
            else:
                logger.info("No grocery results found with Atlas Search")
                
                # Try regular search as fallback
                logger.info("Trying regular search as fallback...")
                regex_results = list(grocery_collection.find(
                    {"$or": [
                        {"product": {"$regex": query, "$options": "i"}},
                        {"brand": {"$regex": query, "$options": "i"}},
                        {"category": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(5))
                
                logger.info(f"Found {len(regex_results)} grocery results with regex search")
                if regex_results:
                    logger.info("Sample grocery result from regex search:")
                    sample = regex_results[0].copy()
                    sample["_id"] = str(sample["_id"])
                    logger.info(json.dumps(sample, indent=2))
        except Exception as e:
            logger.error(f"Atlas Search error on grocery collection: {e}")
        
        # Test Atlas Search on products collection
        logger.info("\nTesting Atlas Search on products collection...")
        try:
            # Use Atlas Search with wildcard path
            pipeline = [
                {
                    "$search": {
                        "index": "default-products",
                        "text": {
                            "query": query,
                            "path": {
                                "wildcard": "*"
                            },
                            "fuzzy": {
                                "maxEdits": 2
                            }
                        }
                    }
                },
                # Limit results
                {"$limit": 5}
            ]
            
            product_results = list(products_collection.aggregate(pipeline))
            logger.info(f"Found {len(product_results)} product results with Atlas Search")
            
            if product_results:
                logger.info("Sample product result:")
                # Convert ObjectId to string for display
                sample = product_results[0].copy()
                sample["_id"] = str(sample["_id"])
                logger.info(json.dumps(sample, indent=2))
            else:
                logger.info("No product results found with Atlas Search")
                
                # Try regular search as fallback
                logger.info("Trying regular search as fallback...")
                regex_results = list(products_collection.find(
                    {"$or": [
                        {"recipe_name": {"$regex": query, "$options": "i"}},
                        {"food_name": {"$regex": query, "$options": "i"}}
                    ]}
                ).limit(5))
                
                logger.info(f"Found {len(regex_results)} product results with regex search")
                if regex_results:
                    logger.info("Sample product result from regex search:")
                    sample = regex_results[0].copy()
                    sample["_id"] = str(sample["_id"])
                    logger.info(json.dumps(sample, indent=2))
        except Exception as e:
            logger.error(f"Atlas Search error on products collection: {e}")
        
        return True
    except Exception as e:
        logger.error(f"MongoDB connection error: {e}")
        return False

if __name__ == "__main__":
    # Test with default query "apple"
    test_atlas_search()
    
    # Test with a custom query if provided
    import sys
    if len(sys.argv) > 1:
        test_atlas_search(sys.argv[1])
