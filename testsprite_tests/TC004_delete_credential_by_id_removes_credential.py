import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Replace these with valid credentials for authentication
USERNAME = "testuser"
PASSWORD = "testpassword"

def authenticate():
    url = f"{BASE_URL}/api/users/login"
    payload = {"username": USERNAME, "password": PASSWORD}
    response = requests.post(url, json=payload, timeout=TIMEOUT)
    response.raise_for_status()
    token = response.json().get("token")
    assert token, "Authentication failed, no token received"
    return token

def create_credential(headers):
    url = f"{BASE_URL}/api/credentials"
    # Use a unique credential name to avoid conflicts
    credential_name = f"test_credential_{uuid.uuid4()}"
    # For testing, credential_value can be a dummy encrypted string
    credential_value = "encrypted_dummy_value"
    payload = {
        "credential_name": credential_name,
        "credential_value": credential_value
    }
    response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    response.raise_for_status()
    # After creation, get the list of credentials to find the new credential's ID
    get_resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    get_resp.raise_for_status()
    credentials = get_resp.json()
    # Find credential by name
    for cred in credentials:
        if cred.get("credential_name") == credential_name:
            return cred.get("id")
    raise Exception("Created credential ID not found")

def delete_credential_by_id_test():
    token = authenticate()
    headers = {"Authorization": f"Bearer {token}"}

    credential_id = None
    try:
        # Create a credential to delete
        credential_id = create_credential(headers)
        assert credential_id, "Failed to create credential for deletion test"

        # Delete the credential by ID
        delete_url = f"{BASE_URL}/api/credentials/{credential_id}"
        delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)

        # Validate response status code 204 No Content
        assert delete_resp.status_code == 204, f"Expected status code 204, got {delete_resp.status_code}"

        # Verify credential is actually deleted by attempting to get credentials and checking absence
        get_resp = requests.get(f"{BASE_URL}/api/credentials", headers=headers, timeout=TIMEOUT)
        get_resp.raise_for_status()
        credentials = get_resp.json()
        ids = [cred.get("id") for cred in credentials]
        assert credential_id not in ids, "Credential was not deleted successfully"

    finally:
        # Cleanup: If credential still exists, attempt to delete it
        if credential_id:
            try:
                requests.delete(f"{BASE_URL}/api/credentials/{credential_id}", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

delete_credential_by_id_test()