import requests
import json

BASE_URL = "http://localhost:8000"
WORKFLOWS_ENDPOINT = f"{BASE_URL}/api/workflows"
LOGIN_ENDPOINT = f"{BASE_URL}/api/users/login"
LOGOUT_ENDPOINT = f"{BASE_URL}/api/users/logout"

USERNAME = "testuser"
PASSWORD = "testpassword"

def test_post_workflows_submits_new_or_updated_workflow():
    # Login to get JWT token
    login_payload = {"username": USERNAME, "password": PASSWORD}
    login_resp = requests.post(LOGIN_ENDPOINT, json=login_payload, timeout=30)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token, "JWT token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Define a sample valid workflow JSON configuration
    workflow_json = {
        "nodes": [
            {
                "id": "node1",
                "type": "trigger",
                "name": "Start Trigger",
                "parameters": {}
            },
            {
                "id": "node2",
                "type": "llm",
                "name": "OpenAI LLM Node",
                "parameters": {
                    "model": "gpt-4",
                    "prompt": "Hello, world!"
                }
            }
        ],
        "connections": [
            {"from": "node1", "to": "node2"}
        ],
        "metadata": {
            "name": "Test Workflow",
            "description": "A workflow for testing POST /api/workflows"
        }
    }

    try:
        # POST the workflow JSON to /api/workflows
        resp = requests.post(
            WORKFLOWS_ENDPOINT,
            headers=headers,
            json={"workflow_json": workflow_json},
            timeout=30
        )
        assert resp.status_code == 200, f"Unexpected status code: {resp.status_code}, response: {resp.text}"
        resp_json = resp.json()
        # Expecting a success or error message in response JSON
        assert "message" in resp_json or "error" in resp_json, "Response JSON missing 'message' or 'error' key"

        # If error key present, fail the test
        if "error" in resp_json:
            assert False, f"API returned error: {resp_json['error']}"

        # If message key present, check it indicates success
        if "message" in resp_json:
            assert isinstance(resp_json["message"], str) and len(resp_json["message"]) > 0, "Empty success message"

    finally:
        # Logout to invalidate token
        requests.post(LOGOUT_ENDPOINT, headers=headers, timeout=30)

test_post_workflows_submits_new_or_updated_workflow()