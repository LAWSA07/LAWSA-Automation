import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, headers=None, description=""):
    """Test a single endpoint"""
    print(f"\n🔍 Testing {description}")
    print(f"   {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(f"{BASE_URL}{endpoint}", json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(f"{BASE_URL}{endpoint}", headers=headers)
        
        print(f"   Status: {response.status_code}")
        if response.status_code < 400:
            print(f"   ✅ Success")
            if response.text:
                try:
                    result = response.json()
                    print(f"   Response: {json.dumps(result, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
        else:
            print(f"   ❌ Error: {response.text}")
        
        return response
        
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return None

def main():
    print("🚀 Testing LAWSA Backend Endpoints")
    print("=" * 50)
    
    # Test 1: Health Check
    test_endpoint("GET", "/health", description="Health Check")
    
    # Test 2: Home endpoint
    test_endpoint("GET", "/", description="Home Page")
    
    # Test 3: Register a new user
    unique_email = f"test_{int(time.time())}@example.com"
    register_data = {
        "email": unique_email,
        "password": "test123"
    }
    print(f"   Using registration email: {unique_email}")
    register_response = test_endpoint("POST", "/auth/register", data=register_data, description="User Registration")
    
    if register_response and register_response.status_code == 200:
        token_data = register_response.json()
        token = token_data.get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        print(f"\n🔑 Got token: {token[:20]}...")
        
        # Test 4: Login with the same user
        login_response = test_endpoint("POST", "/auth/login", data=register_data, description="User Login")
        
        # Test 5: Get available models
        test_endpoint("GET", "/api/models", headers=headers, description="Get Available Models")
        
        # Test 6: Get available providers
        test_endpoint("GET", "/api/providers", headers=headers, description="Get Available Providers")
        
        # Test 7: Get available tools
        test_endpoint("GET", "/api/tools", headers=headers, description="Get Available Tools")
        
        # Test 8: Create a workflow (input -> web search -> llm)
        workflow_data = {
            "name": "Test Workflow with Web Search and LLM",
            "nodes": [
                {
                    "id": "node_input",
                    "type": "input",
                    "position": {"x": 100, "y": 100},
                    "config": {}
                },
                {
                    "id": "node_search",
                    "type": "tavily_search",
                    "position": {"x": 220, "y": 100},
                    "config": {"query_template": "{{input}}"}
                },
                {
                    "id": "node_llm", 
                    "type": "llm",
                    "position": {"x": 360, "y": 100},
                    "config": {
                        "provider": "groq",
                        "model": "llama3-8b-8192"
                    }
                }
            ],
            "edges": [
                {"id": "edge_input_search", "source": "node_input", "target": "node_search"},
                {"id": "edge_search_llm", "source": "node_search", "target": "node_llm"}
            ]
        }
        
        create_workflow_response = test_endpoint("POST", "/api/workflows", data=workflow_data, headers=headers, description="Create Workflow")
        
        if create_workflow_response and create_workflow_response.status_code == 200:
            workflow_id = create_workflow_response.json().get("id")
            
            # Test 9: Get specific workflow
            test_endpoint("GET", f"/api/workflows/{workflow_id}", headers=headers, description="Get Specific Workflow")
            
            # Test 10: Update workflow
            update_data = {
                "name": "Updated Test Workflow",
                "nodes": workflow_data["nodes"],
                "edges": workflow_data["edges"]
            }
            test_endpoint("PUT", f"/api/workflows/{workflow_id}", data=update_data, headers=headers, description="Update Workflow")
            
            # Test 11: Get all workflows
            test_endpoint("GET", "/api/workflows", headers=headers, description="Get All Workflows")
            
            # Test 12: Create a credential
            credential_data = {
                "name": "Test API Key",
                "type": "api_key",
                "config": {
                    "api_key": "sk-test123",
                    "provider": "groq"
                }
            }
            test_endpoint("POST", "/api/credentials", data=credential_data, headers=headers, description="Create Credential")
            
            # Test 13: Get all credentials
            test_endpoint("GET", "/api/credentials", headers=headers, description="Get All Credentials")
            
            # Test 14: Execute workflow
            execution_data = {
                "graph": workflow_data,
                "input": "Search latest headlines about AI safety this week and summarize in 2 bullets.",
                "thread_id": f"thread_{int(time.time())}"
            }
            test_endpoint("POST", "/execute-agent", data=execution_data, headers=headers, description="Execute Workflow")
            
            # Test 15: Delete workflow
            test_endpoint("DELETE", f"/api/workflows/{workflow_id}", headers=headers, description="Delete Workflow")
    
    # Test 16: Test without authentication (should fail)
    test_endpoint("GET", "/api/workflows", description="Get Workflows Without Auth (Should Fail)")
    
    # Test 17: Test invalid login
    invalid_login_data = {
        "email": "invalid@example.com",
        "password": "wrongpassword"
    }
    test_endpoint("POST", "/auth/login", data=invalid_login_data, description="Invalid Login (Should Fail)")
    
    print("\n" + "=" * 50)
    print("🎉 Backend Endpoint Testing Complete!")

if __name__ == "__main__":
    main()
