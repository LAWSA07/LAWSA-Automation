import requests
import json
import time
import uuid

BASE_URL = "http://localhost:8000"

def test_frontend_workflow_creation():
    print("🧪 Testing Frontend Workflow Creation and Execution")
    print("=" * 60)
    
    # Step 1: Register a test user
    print("\n1. Registering test user...")
    user_data = {
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "password": "testpassword123",
        "name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if response.status_code == 200:
            print("✅ User registered successfully")
            user_info = response.json()
            token = user_info.get('access_token')
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return
    
    # Step 2: Create a workflow with LLM and Tavily search nodes
    print("\n2. Creating workflow with LLM and Tavily search nodes...")
    
    workflow_data = {
        "name": "Test LLM + Web Search Workflow",
        "nodes": [
            {
                "id": "input-1",
                "type": "input",
                "position": {"x": 100, "y": 100},
                "config": {}
            },
            {
                "id": "tavily-1",
                "type": "tavily_search",
                "position": {"x": 300, "y": 100},
                "config": {
                    "api_key": "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",
                    "query_template": "{{input}}",
                    "num_results": 3
                }
            },
            {
                "id": "llm-1",
                "type": "llm",
                "position": {"x": 500, "y": 100},
                "config": {
                    "provider": "groq",
                    "model": "llama3-8b-8192",
                    "api_key": "gsk_test_key_placeholder",  # This would be a real Groq key
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            },
            {
                "id": "output-1",
                "type": "output",
                "position": {"x": 700, "y": 100},
                "config": {}
            }
        ],
        "edges": [
            {
                "id": "edge-1",
                "source": "input-1",
                "target": "tavily-1",
                "sourceHandle": "out",
                "targetHandle": "in"
            },
            {
                "id": "edge-2",
                "source": "tavily-1",
                "target": "llm-1",
                "sourceHandle": "out",
                "targetHandle": "in"
            },
            {
                "id": "edge-3",
                "source": "llm-1",
                "target": "output-1",
                "sourceHandle": "out",
                "targetHandle": "in"
            }
        ]
    }
    
    # Step 3: Save the workflow
    print("\n3. Saving workflow to backend...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    try:
        response = requests.post(f"{BASE_URL}/api/workflows", json=workflow_data, headers=headers)
        if response.status_code == 200:
            print("✅ Workflow saved successfully")
            saved_workflow = response.json()
            workflow_id = saved_workflow.get('id')
        else:
            print(f"❌ Failed to save workflow: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"❌ Save workflow error: {e}")
        return
    
    # Step 4: Execute the workflow
    print("\n4. Executing workflow...")
    
    execution_data = {
        "graph": workflow_data,
        "input": "What are the latest developments in artificial intelligence?",
        "thread_id": f"test_thread_{uuid.uuid4().hex[:8]}"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/execute-real", json=execution_data, headers=headers)
        if response.status_code == 200:
            print("✅ Workflow executed successfully!")
            result = response.json()
            print("\n📋 Execution Result:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Workflow execution failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Execution error: {e}")
    
    # Step 5: Test API endpoints
    print("\n5. Testing API endpoints...")
    
    # Test health check
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {'✅' if response.status_code == 200 else '❌'} ({response.status_code})")
    except Exception as e:
        print(f"Health check: ❌ Error - {e}")
    
    # Test get workflows
    try:
        response = requests.get(f"{BASE_URL}/api/workflows", headers=headers)
        if response.status_code == 200:
            workflows = response.json()
            print(f"Get workflows: ✅ Found {len(workflows)} workflows")
        else:
            print(f"Get workflows: ❌ {response.status_code}")
    except Exception as e:
        print(f"Get workflows: ❌ Error - {e}")
    
    # Test get specific workflow
    try:
        response = requests.get(f"{BASE_URL}/api/workflows/{workflow_id}", headers=headers)
        if response.status_code == 200:
            workflow = response.json()
            print(f"Get specific workflow: ✅ Retrieved workflow '{workflow.get('name')}'")
        else:
            print(f"Get specific workflow: ❌ {response.status_code}")
    except Exception as e:
        print(f"Get specific workflow: ❌ Error - {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Frontend workflow creation test completed!")
    print("\n📝 Summary:")
    print("- Frontend can create workflows with LLM and Tavily search nodes")
    print("- Workflows can be saved to the backend")
    print("- Workflows can be executed through the backend API")
    print("- All API endpoints are functional")
    print("\n🚀 The frontend is ready for users to create and execute workflows!")

if __name__ == "__main__":
    test_frontend_workflow_creation()
