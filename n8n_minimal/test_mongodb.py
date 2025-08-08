import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

async def test_mongodb_connection():
    try:
        # Get MongoDB URI from environment
        mongodb_uri = os.getenv("MONGODB_URI")
        print(f"Testing connection to: {mongodb_uri}")
        
        # Create client
        client = AsyncIOMotorClient(mongodb_uri)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database
        db = client.lawsa  # Use specific database name
        print(f"✅ Database: {db.name}")
        
        # Test collection operations
        collection = db.users
        print(f"✅ Collection: {collection.name}")
        
        # Test a simple operation
        count = await collection.count_documents({})
        print(f"✅ Current users count: {count}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_mongodb_connection())
