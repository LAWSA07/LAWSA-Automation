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
        
        print(f"   Status: {response.status_code}")
        if response.status_code < 400:
            print(f"   ✅ Success")
            if response.text:
                try:
                    result = response.json()
                    print(f"   Response: {json.dumps(result, indent=2)[:300]}...")
                except:
                    print(f"   Response: {response.text[:300]}...")
        else:
            print(f"   ❌ Error: {response.text}")
        
        return response
        
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return None

def main():
    print("🚀 Testing Fixed Backend Authentication")
    print("=" * 50)
    
    # Test 1: Health Check
    test_endpoint("GET", "/health", description="Health Check")
    
    # Test 2: Register a new user
    unique_email = f"test_fixed_{int(time.time())}@example.com"
    register_data = {
        "email": unique_email,
        "password": "test123"
    }
    print(f"   Using registration email: {unique_email}")
    register_response = test_endpoint("POST", "/auth/register", data=register_data, description="User Registration")
    
    if register_response and register_response.status_code == 200:
        token_data = register_response.json()
        token = token_data.get("access_token")
        print(f"\n🔑 Got token: {token[:50]}...")
        
        # Test with proper Authorization header
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 3: Get available models with proper auth
        test_endpoint("GET", "/api/models", headers=headers, description="Get Available Models")
        
        # Test 4: Get available providers
        test_endpoint("GET", "/api/providers", headers=headers, description="Get Available Providers")
        
        # Test 5: Get available tools
        test_endpoint("GET", "/api/tools", headers=headers, description="Get Available Tools")
        
        # Test 6: Create a simple workflow
        workflow_data = {
            "name": "Test Workflow",
            "nodes": [
                {
                    "id": "node1",
                    "type": "input",
                    "position": {"x": 100, "y": 100},
                    "config": {}
                }
            ],
            "edges": []
        }
        
        create_workflow_response = test_endpoint("POST", "/api/workflows", data=workflow_data, headers=headers, description="Create Workflow")
        
        if create_workflow_response and create_workflow_response.status_code == 200:
            workflow_id = create_workflow_response.json().get("id")
            print(f"\n📋 Created workflow with ID: {workflow_id}")
            
            # Test 7: Get all workflows
            test_endpoint("GET", "/api/workflows", headers=headers, description="Get All Workflows")
            
            # Test 8: Create a credential
            credential_data = {
                "name": "Test API Key",
                "type": "api_key",
                "config": {
                    "api_key": "sk-test123",
                    "provider": "groq"
                }
            }
            test_endpoint("POST", "/api/credentials", data=credential_data, headers=headers, description="Create Credential")
            
            # Test 9: Get all credentials
            test_endpoint("GET", "/api/credentials", headers=headers, description="Get All Credentials")
    
    print("\n" + "=" * 50)
    print("🎉 Fixed Backend Testing Complete!")

if __name__ == "__main__":
    main()
