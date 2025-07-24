import os
from dotenv import load_dotenv

# In production, environment variables should be injected by the platform (Docker, cloud, etc.)
# For local development, .env is loaded as a fallback
if os.getenv("ENV", "development") != "production":
    load_dotenv()
 
# MongoDB
MONGODB_URI = os.getenv("MONGODB_URI")

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Security
SECRET_KEY = os.getenv("SECRET_KEY") 

# ---
# Best practice: In production, set all secrets as environment variables (not in .env)
# For even higher security, use a secrets manager (AWS Secrets Manager, GCP Secret Manager, Vault, etc.)
# Never commit secrets to version control! 