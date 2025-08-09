import requests
import json

KEY = "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"
URL = "https://api.tavily.com/search"
PAYLOAD = {"query": "hello", "num_results": 1}

def try_x_api_key():
    headers = {"Content-Type": "application/json", "X-API-Key": KEY}
    r = requests.post(URL, json=PAYLOAD, headers=headers)
    print("X-API-Key status:", r.status_code)
    try:
        print(json.dumps(r.json(), indent=2)[:1000])
    except Exception:
        print(r.text[:1000])

def try_bearer():
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {KEY}"}
    r = requests.post(URL, json=PAYLOAD, headers=headers)
    print("Bearer status:", r.status_code)
    try:
        print(json.dumps(r.json(), indent=2)[:1000])
    except Exception:
        print(r.text[:1000])

if __name__ == "__main__":
    try_x_api_key()
    print("\n---\n")
    try_bearer()


