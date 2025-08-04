from cryptography.fernet import Fernet
from .db import get_db_from_uri
import os
from .security import encrypt_data, decrypt_data
import uuid

FERNET_KEY = os.environ.get("FERNET_KEY")
if not FERNET_KEY:
    raise RuntimeError("FERNET_KEY environment variable must be set for credential encryption.")
fernet = Fernet(FERNET_KEY.encode() if isinstance(FERNET_KEY, str) else FERNET_KEY)

def encrypt(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()

def create_credential(connection_string, name, type_, data):
    _, db = get_db_from_uri(connection_string)
    enc_data = encrypt(data)
    cred = {"name": name, "type": type_, "data": enc_data}
    return str(db.credentials.insert_one(cred).inserted_id)

def get_credential(connection_string, id):
    _, db = get_db_from_uri(connection_string)
    cred = db.credentials.find_one({"_id": id})
    if cred:
        cred["data"] = decrypt(cred["data"])
    return cred

def list_credentials(connection_string):
    _, db = get_db_from_uri(connection_string)
    return [{"id": str(c["_id"]), "name": c["name"], "type": c["type"]} for c in db.credentials.find()]

async def save_credential(name: str, connection_string: str):
    encrypted = encrypt_data(connection_string)
    credential_id = f"cred_{uuid.uuid4().hex}"
    _, db = get_db_from_uri("mongodb://localhost:27017/yourappdb")  # Use your admin DB
    await db.credentials.insert_one({
        "credential_id": credential_id,
        "name": name,
        "encrypted_connection_string": encrypted
    })
    return credential_id

async def get_connection_string(credential_id: str):
    _, db = get_db_from_uri("mongodb://localhost:27017/yourappdb")
    cred = await db.credentials.find_one({"credential_id": credential_id})
    if not cred:
        return None
    return decrypt_data(cred["encrypted_connection_string"]) 