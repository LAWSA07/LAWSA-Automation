import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Assuming JWT authentication is required, provide a valid token here
# For this test, we assume a token is available; replace 'your_jwt_token' with a valid token.
JWT_TOKEN = "your_jwt_token"

def test_get_tools_returns_tool_configurations():
    url = f"{BASE_URL}/api/tools"
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        tools = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(tools, list), "Response JSON is not a list"

    # Check that at least one tool has the expected keys
    expected_tool_keys = {"tavily_search", "multiply", "send_email", "post_to_slack"}
    found_keys = set()
    for tool in tools:
        if not isinstance(tool, dict):
            continue
        found_keys.update(tool.keys())

    missing_keys = expected_tool_keys - found_keys
    assert not missing_keys, f"Missing expected tool configurations: {missing_keys}"

test_get_tools_returns_tool_configurations()