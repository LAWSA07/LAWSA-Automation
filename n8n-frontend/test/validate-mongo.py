from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

uri = "mongodb+srv://aswalh0707:ASXMZYa5r2KkPHJO@automation.sfe092t.mongodb.net/?retryWrites=true&w=majority&appName=automation"

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ Connection successful!")
except ConnectionFailure as e:
    print("❌ Connection failed:", e) 