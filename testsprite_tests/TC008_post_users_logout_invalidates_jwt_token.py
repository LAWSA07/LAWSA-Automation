import requests

BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = "/api/users/login"
LOGOUT_ENDPOINT = "/api/users/logout"
TIMEOUT = 30

def test_post_users_logout_invalidates_jwt_token():
    login_url = BASE_URL + LOGIN_ENDPOINT
    logout_url = BASE_URL + LOGOUT_ENDPOINT

    # Use test credentials - replace with valid test user credentials
    credentials = {
        "username": "testuser",
        "password": "testpassword"
    }

    # Step 1: Login to get JWT token
    try:
        login_response = requests.post(login_url, json=credentials, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_data = login_response.json()
        assert "token" in login_data, "JWT token not found in login response"
        token = login_data["token"]
    except Exception as e:
        raise AssertionError(f"Login request failed: {e}")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Step 2: Logout to invalidate the JWT token
    try:
        logout_response = requests.post(logout_url, headers=headers, timeout=TIMEOUT)
        assert logout_response.status_code == 200, f"Logout failed with status {logout_response.status_code}"
        logout_data = logout_response.json()
        # Assuming success message is in a key like 'message' or similar
        assert any(
            key in logout_data and isinstance(logout_data[key], str) and "success" in logout_data[key].lower()
            for key in logout_data
        ), "Logout success message not found or invalid"
    except Exception as e:
        raise AssertionError(f"Logout request failed: {e}")

    # Step 3: Verify token is invalidated by attempting an authenticated request with the same token
    # We'll try to call /api/credentials GET endpoint which requires auth
    credentials_url = BASE_URL + "/api/credentials"
    try:
        auth_check_response = requests.get(credentials_url, headers=headers, timeout=TIMEOUT)
        # Expecting unauthorized or forbidden status since token should be invalidated
        assert auth_check_response.status_code in (401, 403), (
            f"Token was not invalidated after logout, status code: {auth_check_response.status_code}"
        )
    except Exception as e:
        raise AssertionError(f"Auth check request failed: {e}")

test_post_users_logout_invalidates_jwt_token()