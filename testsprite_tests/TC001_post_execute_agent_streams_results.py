import requests
import json

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Example JWT token for authentication; replace with a valid token if needed
JWT_TOKEN = "your_jwt_token_here"

def test_post_execute_agent_streams_results():
    url = f"{BASE_URL}/execute-agent"
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
    }

    # Example minimal workflow definition for testing
    workflow_definition = {
        "nodes": [
            {
                "id": "node1",
                "type": "input",
                "parameters": {"input": "Test input"}
            },
            {
                "id": "node2",
                "type": "agent",
                "parameters": {"agent_type": "test-agent"}
            }
        ],
        "connections": [
            {"source": "node1", "target": "node2"}
        ]
    }

    payload = {
        "workflow_definition": workflow_definition
    }

    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=TIMEOUT) as response:
            assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
            assert response.headers.get("Content-Type", "").startswith("text/event-stream"), \
                f"Expected Content-Type to start with 'text/event-stream', got {response.headers.get('Content-Type')}"

            # Read streamed Server-Sent Events (SSE)
            event_data_received = False
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    # SSE lines start with "data: "
                    if line.startswith("data:"):
                        event_data_received = True
                        data_str = line[len("data:"):].strip()
                        # Try to parse JSON data if possible
                        try:
                            data_json = json.loads(data_str)
                            # Basic validation: data_json should be a dict or list
                            assert isinstance(data_json, (dict, list)), "Streamed data is not a JSON object or array"
                        except json.JSONDecodeError:
                            # If not JSON, just ensure non-empty string
                            assert len(data_str) > 0, "Streamed data is empty"
                        # For this test, receiving at least one data event is sufficient
                        break

            assert event_data_received, "No Server-Sent Event data received in stream"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_execute_agent_streams_results()
