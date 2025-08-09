import os
import time
import json
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"


def auth_register():
    email = f"wf_{int(time.time())}@example.com"
    password = "test123"
    r = requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password})
    r.raise_for_status()
    token = r.json()["access_token"]
    return token


def create_workflow(headers):
    graph = {
        "name": "Web Search + LLM",
        "nodes": [
            {"id": "node_input", "type": "input", "position": {"x": 0, "y": 0}, "config": {}},
            {
                "id": "node_search",
                "type": "tavily_search",
                "position": {"x": 200, "y": 0},
                "config": {
                    "query_template": "{{input}}",
                    "num_results": 3,
                    # allow backend to use node key or env fallback
                    "api_key": os.getenv("TAVILY_API_KEY"),
                },
            },
            {
                "id": "node_llm",
                "type": "llm",
                "position": {"x": 400, "y": 0},
                "config": {
                    "provider": "groq",
                    "model": "llama3-8b-8192",
                    "max_tokens": 256,
                    "api_key": os.getenv("GROQ_API_KEY"),
                },
            },
        ],
        "edges": [
            {"id": "e1", "source": "node_input", "target": "node_search"},
            {"id": "e2", "source": "node_search", "target": "node_llm"},
        ],
    }
    r = requests.post(f"{BASE_URL}/api/workflows", json=graph, headers=headers)
    r.raise_for_status()
    return r.json(), graph


def execute_real(graph, headers, text):
    payload = {
        "graph": graph,
        "input": text,
        "thread_id": f"thread_{int(time.time())}",
    }
    r = requests.post(f"{BASE_URL}/execute-real", json=payload, headers=headers)
    return r


def main():
    token = auth_register()
    headers = {"Authorization": f"Bearer {token}"}

    created, graph = create_workflow(headers)
    print("Created workflow:")
    print(json.dumps(created, indent=2)[:600])

    print("\nExecuting with web search + LLM...")
    r = execute_real(graph, headers, "Latest AI safety headlines this week; summarize in 2 bullets.")
    print("status:", r.status_code)
    try:
        print(json.dumps(r.json(), indent=2)[:2000])
    except Exception:
        print(r.text[:1000])

    if r.status_code != 200:
        # Fallback: LLM-only graph
        print("\nFalling back to LLM-only (no web search)...")
        llm_only = {
            **graph,
            "nodes": [n for n in graph["nodes"] if n["id"] != "node_search"],
            "edges": [{"id": "e_input_llm", "source": "node_input", "target": "node_llm"}],
        }
        r2 = execute_real(llm_only, headers, "Explain AI safety in 2 bullets.")
        print("status:", r2.status_code)
        try:
            print(json.dumps(r2.json(), indent=2)[:2000])
        except Exception:
            print(r2.text[:1000])


if __name__ == "__main__":
    main()


