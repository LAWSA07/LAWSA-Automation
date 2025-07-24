from motor.motor_asyncio import AsyncIOMotorClient

def get_db_from_uri(connection_string: str):
    client = AsyncIOMotorClient(connection_string)
    db = client.get_default_database()
    return client, db 