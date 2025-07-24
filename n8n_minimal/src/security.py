from cryptography.fernet import Fernet
from .config import SECRET_KEY

fernet = Fernet(SECRET_KEY.encode())

def encrypt_data(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    return fernet.decrypt(encrypted_data.encode()).decode() 