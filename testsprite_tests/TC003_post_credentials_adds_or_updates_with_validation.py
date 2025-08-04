import requests
import json
import base64
from cryptography.fernet import Fernet

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Sample user credentials for login (should be replaced with valid test user credentials)
USERNAME = "testuser"
PASSWORD = "testpassword"

# Fernet key for encryption (in real scenario, this should be securely obtained)
# For testing, generate a key or use a fixed key for encryption consistency
FERNET_KEY = Fernet.generate_key()
fernet = Fernet(FERNET_KEY)


def login():
    url = f"{BASE_URL}/api/users/login"
    payload = {"username": USERNAME, "password": PASSWORD}
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    token = resp.json().get("token")
    assert token, "Login failed: No token received"
    return token


def delete_credential(credential_id, headers):
    url = f"{BASE_URL}/api/credentials/{credential_id}"
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    # 204 No Content expected on successful deletion
    assert resp.status_code == 204, f"Failed to delete credential {credential_id}"


def test_post_credentials_adds_or_updates_with_validation():
    token = login()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # Prepare a credential name and value
    credential_name = "test_api_key"
    raw_credential_value = "my-secret-api-key-123"

    # Encrypt the credential value using Fernet
    encrypted_value_bytes = fernet.encrypt(raw_credential_value.encode())
    encrypted_value_str = encrypted_value_bytes.decode()

    payload = {
        "credential_name": credential_name,
        "credential_value": encrypted_value_str,
    }

    created_credential_id = None

    try:
        # POST to add or update credential
        url = f"{BASE_URL}/api/credentials"
        resp = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT)

        # The API returns 200 with success or validation error message
        assert resp.status_code == 200, f"Unexpected status code: {resp.status_code}"

        resp_json = resp.json()
        # Expecting a success message or validation error message in response JSON
        # We check for keys or messages indicating success or validation error
        # Example success: {"message": "Credential added successfully"}
        # Example error: {"error": "Validation failed: ..."}
        assert (
            "message" in resp_json or "error" in resp_json
        ), "Response JSON missing expected keys"

        if "error" in resp_json:
            # Validation error case: ensure error message is non-empty string
            assert isinstance(resp_json["error"], str) and resp_json["error"], "Empty error message"
        else:
            # Success case: message should be non-empty string
            assert isinstance(resp_json["message"], str) and resp_json["message"], "Empty success message"

            # To clean up, retrieve credentials to find the created credential ID
            get_resp = requests.get(f"{BASE_URL}/api/credentials", headers=headers, timeout=TIMEOUT)
            assert get_resp.status_code == 200, "Failed to get credentials after creation"
            credentials = get_resp.json()
            # Find credential by name
            for cred in credentials:
                if cred.get("credential_name") == credential_name:
                    created_credential_id = cred.get("id")
                    break
            assert created_credential_id, "Created credential ID not found in credentials list"

    finally:
        # Cleanup: delete the created credential if it exists
        if created_credential_id:
            try:
                delete_credential(created_credential_id, headers)
            except Exception as e:
                print(f"Cleanup failed: could not delete credential {created_credential_id}: {e}")


test_post_credentials_adds_or_updates_with_validation()