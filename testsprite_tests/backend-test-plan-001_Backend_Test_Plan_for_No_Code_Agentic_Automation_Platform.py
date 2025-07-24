import requests
import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Sample user credentials for authentication
USER_CREDENTIALS = {
    "username": "testuser",
    "password": "testpassword"
}

def test_backend_no_code_agentic_automation_platform():
    """
    Automated backend test plan covering authentication, credential management,
    workflow CRUD, execution, streaming, and node execution for the no-code agentic automation platform.
    """

    # 1. Authenticate and get JWT token
    auth_url = f"{BASE_URL}/auth/login"
    try:
        auth_resp = requests.post(auth_url, json=USER_CREDENTIALS, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        token = auth_data.get("access_token")
        assert token, "No access token received"
    except requests.RequestException as e:
        assert False, f"Authentication request failed: {e}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Credential Management - Create Credential
    credential_payload = {
        "name": "test-credential",
        "type": "openai",
        "data": {
            "apiKey": "sk-testapikey"
        }
    }
    credential_id = None
    try:
        cred_create_resp = requests.post(f"{BASE_URL}/credentials", json=credential_payload, headers=headers, timeout=TIMEOUT)
        assert cred_create_resp.status_code == 201, f"Credential creation failed: {cred_create_resp.text}"
        credential = cred_create_resp.json()
        credential_id = credential.get("id")
        assert credential_id, "Credential ID not returned"

        # 3. Validate Credential
        validate_resp = requests.post(f"{BASE_URL}/credentials/{credential_id}/validate", headers=headers, timeout=TIMEOUT)
        assert validate_resp.status_code == 200, f"Credential validation failed: {validate_resp.text}"
        validate_data = validate_resp.json()
        assert validate_data.get("valid") is True, "Credential validation returned invalid"

        # 4. Workflow CRUD - Create Workflow
        workflow_payload = {
            "name": "test-workflow",
            "nodes": [
                {
                    "id": "node1",
                    "type": "trigger",
                    "parameters": {}
                },
                {
                    "id": "node2",
                    "type": "llm",
                    "parameters": {
                        "credentialId": credential_id,
                        "model": "gpt-4",
                        "prompt": "Say hello"
                    }
                }
            ],
            "connections": [
                {"source": "node1", "target": "node2"}
            ]
        }
        workflow_id = None
        try:
            wf_create_resp = requests.post(f"{BASE_URL}/workflows", json=workflow_payload, headers=headers, timeout=TIMEOUT)
            assert wf_create_resp.status_code == 201, f"Workflow creation failed: {wf_create_resp.text}"
            workflow = wf_create_resp.json()
            workflow_id = workflow.get("id")
            assert workflow_id, "Workflow ID not returned"

            # 5. Get Workflow
            wf_get_resp = requests.get(f"{BASE_URL}/workflows/{workflow_id}", headers=headers, timeout=TIMEOUT)
            assert wf_get_resp.status_code == 200, f"Get workflow failed: {wf_get_resp.text}"
            wf_data = wf_get_resp.json()
            assert wf_data.get("name") == "test-workflow", "Workflow name mismatch"

            # 6. Update Workflow
            update_payload = {"name": "test-workflow-updated"}
            wf_update_resp = requests.put(f"{BASE_URL}/workflows/{workflow_id}", json=update_payload, headers=headers, timeout=TIMEOUT)
            assert wf_update_resp.status_code == 200, f"Workflow update failed: {wf_update_resp.text}"
            updated_wf = wf_update_resp.json()
            assert updated_wf.get("name") == "test-workflow-updated", "Workflow update name mismatch"

            # 7. Execute Workflow
            exec_resp = requests.post(f"{BASE_URL}/workflows/{workflow_id}/execute", headers=headers, timeout=TIMEOUT)
            assert exec_resp.status_code == 200, f"Workflow execution failed: {exec_resp.text}"
            exec_data = exec_resp.json()
            execution_id = exec_data.get("executionId")
            assert execution_id, "Execution ID not returned"

            # 8. Stream Execution Results (SSE)
            stream_url = f"{BASE_URL}/executions/{execution_id}/stream"
            with requests.get(stream_url, headers=headers, stream=True, timeout=TIMEOUT) as stream_resp:
                assert stream_resp.status_code == 200, f"Streaming failed: {stream_resp.text}"
                # Read some streaming data (simulate)
                lines = []
                for line in stream_resp.iter_lines():
                    if line:
                        lines.append(line.decode('utf-8'))
                    if len(lines) >= 3:
                        break
                assert len(lines) > 0, "No streaming data received"

            # 9. Node Execution - simulate node execution endpoint
            node_exec_payload = {
                "nodeId": "node2",
                "input": {"text": "Hello"}
            }
            node_exec_resp = requests.post(f"{BASE_URL}/nodes/execute", json=node_exec_payload, headers=headers, timeout=TIMEOUT)
            assert node_exec_resp.status_code == 200, f"Node execution failed: {node_exec_resp.text}"
            node_exec_data = node_exec_resp.json()
            assert "output" in node_exec_data, "Node execution output missing"

        finally:
            # Cleanup workflow
            if workflow_id:
                del_wf_resp = requests.delete(f"{BASE_URL}/workflows/{workflow_id}", headers=headers, timeout=TIMEOUT)
                assert del_wf_resp.status_code in (200, 204), f"Workflow deletion failed: {del_wf_resp.text}"

    finally:
        # Cleanup credential
        if credential_id:
            del_cred_resp = requests.delete(f"{BASE_URL}/credentials/{credential_id}", headers=headers, timeout=TIMEOUT)
            assert del_cred_resp.status_code in (200, 204), f"Credential deletion failed: {del_cred_resp.text}"

test_backend_no_code_agentic_automation_platform()
