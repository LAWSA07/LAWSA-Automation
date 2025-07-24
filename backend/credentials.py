from cryptography.fernet import Fernet
from database import get_db
import os

FERNET_KEY = os.environ.get("FERNET_KEY") or Fernet.generate_key()
fernet = Fernet(FERNET_KEY)

def encrypt(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()

def create_credential(name, type_, data):
    db = get_db()
    enc_data = encrypt(data)
    cred = {"name": name, "type": type_, "data": enc_data}
    return str(db.credentials.insert_one(cred).inserted_id)

def get_credential(id):
    db = get_db()
    cred = db.credentials.find_one({"_id": id})
    if cred:
        cred["data"] = decrypt(cred["data"])
    return cred

def list_credentials():
    db = get_db()
    return [{"id": str(c["_id"]), "name": c["name"], "type": c["type"]} for c in db.credentials.find()] 