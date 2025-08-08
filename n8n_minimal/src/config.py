import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB Configuration
# Use the existing MongoDB Atlas connection from .env
MONGODB_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017/yourappdb")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "lawsa_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# API Keys from .env
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3001")

# Database Configuration
def get_mongodb_uri() -> str:
    """Get MongoDB URI with fallback options"""
    return MONGODB_URL

def get_database_name() -> str:
    """Get database name from URI or default"""
    if "lawsa" in MONGODB_URL:
        return "lawsa"
    return "yourappdb" 