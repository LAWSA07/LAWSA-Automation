import requests

def test_post_users_login_returns_jwt_token():
    base_url = "http://localhost:8000"
    login_url = f"{base_url}/api/users/login"
    headers = {
        "Content-Type": "application/json"
    }
    # Use example credentials; adjust if needed for your test environment
    payload = {
        "username": "testuser",
        "password": "testpassword"
    }
    try:
        response = requests.post(login_url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        json_response = response.json()
        assert isinstance(json_response, dict), "Response is not a JSON object"
        assert "token" in json_response or "access_token" in json_response, "JWT token not found in response"
        token = json_response.get("token") or json_response.get("access_token")
        assert isinstance(token, str) and len(token) > 0, "JWT token is empty or not a string"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_users_login_returns_jwt_token()