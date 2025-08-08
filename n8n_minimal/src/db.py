from motor.motor_asyncio import AsyncIOMotorClient

_client_cache = {}

def get_db_from_uri(connection_string: str):
    if connection_string not in _client_cache:
        _client_cache[connection_string] = AsyncIOMotorClient(connection_string)
    client = _client_cache[connection_string]
    # Use specific database name instead of default
    db = client.lawsa
    return client, db 