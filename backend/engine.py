import requests
import os
import datetime
from credentials import get_credential
import traceback

def execute_workflow(workflow_dict, trigger_input=None):
    db = get_db()
    workflow = Workflow(**workflow_dict)
    logs = []
    status = "success"
    data = trigger_input

    try:
        for node in workflow.nodes:
            node_log = {
                "node_id": node.id,
                "node_name": node.name,
                "node_type": node.type,
                "status": "success",
                "message": "",
                "data": None,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
            try:
                logs.append(f"Executing node {node.name} ({node.type})")
                if node.type == "http":
                    url = node.config.get("url")
                    method = node.config.get("method", "GET").upper()
                    headers = node.config.get("headers", {})
                    body = node.config.get("body", None)
                    cred_id = node.config.get("credential_id")
                    if cred_id:
                        cred = get_credential(cred_id)
                        if cred and cred["type"] == "api_key":
                            headers["Authorization"] = f"Bearer {cred['data']}"
                    resp = requests.request(method, url, headers=headers, json=body)
                    logs.append(f"HTTP {method} {url} → {resp.status_code}")
                    logs.append(f"Response: {resp.text[:500]}")
                    data = resp.json() if "application/json" in resp.headers.get("content-type", "") else resp.text
                    node_log["message"] = f"HTTP {method} {url} → {resp.status_code}"
                    node_log["data"] = resp.text[:500]
                elif node.type == "llm":
                    prompt = node.config.get("prompt", "")
                    cred_id = node.config.get("credential_id")
                    if cred_id:
                        cred = get_credential(cred_id)
                        llm_api_key = cred["data"]
                    else:
                        llm_api_key = os.environ.get("LLM_API_KEY")
                    llm_api_url = os.environ.get("LLM_API_URL")
                    if not llm_api_url or not llm_api_key:
                        raise Exception("LLM API credentials not set")
                    payload = {
                        "model": node.config.get("model", "llama3-8b-8192"),
                        "messages": [{"role": "user", "content": prompt}],
                    }
                    headers = {
                        "Authorization": f"Bearer {llm_api_key}",
                        "Content-Type": "application/json"
                    }
                    resp = requests.post(llm_api_url, json=payload, headers=headers)
                    logs.append(f"LLM API {llm_api_url} → {resp.status_code}")
                    result = resp.json()
                    llm_output = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    logs.append(f"LLM Output: {llm_output[:500]}")
                    data = llm_output
                    node_log["message"] = f"LLM API {llm_api_url} → {resp.status_code}"
                    node_log["data"] = llm_output[:500]
                elif node.type == "trigger":
                    logs.append("Trigger node, passing input data.")
                    node_log["message"] = "Trigger node, passing input data."
                elif node.type == "action":
                    action = node.config.get("action")
                    if action == "uppercase" and isinstance(data, str):
                        data = data.upper()
                        logs.append(f"Action: Uppercased data.")
                        node_log["message"] = "Action: Uppercased data."
                        node_log["data"] = data
                    else:
                        logs.append(f"Action: No-op or unknown action.")
                        node_log["message"] = "Action: No-op or unknown action."
                elif node.type == "condition":
                    condition = node.config.get("condition")
                    if condition and isinstance(data, str):
                        result = condition in data
                        logs.append(f"Condition '{condition}' in data: {result}")
                        data = result
                        node_log["message"] = f"Condition '{condition}' in data: {result}"
                        node_log["data"] = result
                    else:
                        logs.append("Condition: No-op or invalid data.")
                        node_log["message"] = "Condition: No-op or invalid data."
                else:
                    logs.append(f"Unknown node type: {node.type}")
                    node_log["message"] = f"Unknown node type: {node.type}"
            except Exception as e:
                logs.append(f"Error: {str(e)}")
                status = "error"
                node_log["status"] = "error"
                node_log["message"] = f"{str(e)}\n{traceback.format_exc()}"
            logs.append(node_log)
        logs.append("Workflow completed.")
    except Exception as e:
        status = "error"
        logs.append({
            "node_id": None,
            "node_name": "Engine",
            "node_type": "engine",
            "status": "error",
            "message": f"{str(e)}\n{traceback.format_exc()}",
            "data": None,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })

    result = {
        "workflow_id": str(workflow_dict.get('_id', '')),
        "status": status,
        "logs": logs,
        "timestamp": datetime.datetime.utcnow()
    }
    exec_id = db.executions.insert_one(result).inserted_id
    return str(exec_id) 