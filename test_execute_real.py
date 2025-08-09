import requests
import json
import time
import os
from dotenv import load_dotenv

# Load env from project root
load_dotenv()

BASE_URL = "http://localhost:8000"

def main():
    # Register user
    email = f"real_{int(time.time())}@example.com"
    password = "test123"
    r = requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password})
    if r.status_code != 200:
        print("register failed:", r.status_code, r.text)
        return
    token = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Build graph: input -> tavily_search -> llm
    graph = {
        "name": "Real Exec",
        "nodes": [
            {"id": "node_input", "type": "input", "position": {"x": 0, "y": 0}, "config": {}},
            {"id": "node_search", "type": "tavily_search", "position": {"x": 200, "y": 0}, "config": {"query_template": "{{input}}", "num_results": 3, "api_key": os.getenv("TAVILY_API_KEY")}},
            {"id": "node_llm", "type": "llm", "position": {"x": 400, "y": 0}, "config": {"provider": "groq", "model": "llama3-8b-8192", "max_tokens": 256, "api_key": os.getenv("GROQ_API_KEY")}},
        ],
        "edges": [
            {"id": "e1", "source": "node_input", "target": "node_search"},
            {"id": "e2", "source": "node_search", "target": "node_llm"},
        ],
    }

    payload = {
        "graph": graph,
        "input": "Latest AI safety headlines this week; summarize in 2 bullets.",
        "thread_id": f"thread_{int(time.time())}",
    }

    r = requests.post(f"{BASE_URL}/execute-real", json=payload, headers=headers)
    print("status:", r.status_code)
    try:
        print(json.dumps(r.json(), indent=2)[:2000])
    except Exception:
        print(r.text[:1000])

if __name__ == "__main__":
    main()


