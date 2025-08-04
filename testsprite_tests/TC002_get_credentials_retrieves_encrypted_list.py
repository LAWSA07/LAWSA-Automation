import requests

BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = f"{BASE_URL}/api/users/login"
CREDENTIALS_ENDPOINT = f"{BASE_URL}/api/credentials"
TIMEOUT = 30

# Replace these with valid test user credentials
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpassword"


def test_get_credentials_retrieves_encrypted_list():
    # Authenticate and get JWT token
    login_payload = {"username": TEST_USERNAME, "password": TEST_PASSWORD}
    try:
        login_resp = requests.post(LOGIN_ENDPOINT, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    login_data = login_resp.json()
    token = login_data.get("token")
    assert token, "JWT token not found in login response"

    headers = {"Authorization": f"Bearer {token}"}

    # Call GET /api/credentials
    try:
        resp = requests.get(CREDENTIALS_ENDPOINT, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/credentials request failed: {e}"

    # Validate response
    assert resp.status_code == 200, f"Expected status code 200, got {resp.status_code}"
    credentials_list = resp.json()
    assert isinstance(credentials_list, list), "Response is not a list"

    # Check that each credential appears encrypted (string type, non-empty)
    for cred in credentials_list:
        assert isinstance(cred, dict), "Each credential should be a dict"
        # We expect encrypted credentials, so at least credential_value should be a non-empty string
        # The exact schema is not fully detailed, so we check for presence of keys and types
        assert "credential_name" in cred, "Credential missing 'credential_name'"
        assert "credential_value" in cred, "Credential missing 'credential_value'"
        assert isinstance(cred["credential_name"], str), "'credential_name' should be a string"
        assert isinstance(cred["credential_value"], str), "'credential_value' should be a string"
        assert len(cred["credential_value"]) > 0, "'credential_value' should not be empty"


test_get_credentials_retrieves_encrypted_list()