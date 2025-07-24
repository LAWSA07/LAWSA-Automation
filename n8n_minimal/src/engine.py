import importlib
from typing import Dict, Any, List
from .models import WorkflowModel, NodeModel
import asyncio

NODE_CLASS_MAP = {
    "ManualTriggerNode": "nodes.manual_trigger.ManualTriggerNode",
    "HttpRequestNode": "nodes.http_request.HttpRequestNode",
    "CodeNode": "nodes.code_node.CodeNode",
    "TelegramNode": "nodes.telegram_node.TelegramNode",
    "GmailNode": "nodes.gmail_node.GmailNode",
    "GroqNode": "nodes.groq_node.GroqNode",
    "WhatsAppNode": "nodes.whatsapp_node.WhatsAppNode",
    "ScheduleTriggerNode": "nodes.schedule_trigger.ScheduleTriggerNode",
    "WebhookTriggerNode": "nodes.webhook_trigger.WebhookTriggerNode",
    "OpenAINode": "nodes.openai_node.OpenAINode",
    "AnthropicNode": "nodes.anthropic_node.AnthropicNode",
    "TavilyNode": "nodes.tavily_node.TavilyNode",
}

RETRYABLE_ERRORS = (asyncio.TimeoutError,)
MAX_RETRIES = 3

def get_node_class(node_type: str):
    module_path, class_name = NODE_CLASS_MAP[node_type].rsplit(".", 1)
    module = importlib.import_module(f"src.{module_path}")
    return getattr(module, class_name)

async def execute_workflow(workflow: Dict[str, Any], input_data: Any = None, job_id: str = None, db=None) -> Any:
    nodes = {node["id"] if "id" in node else str(i): node for i, node in enumerate(workflow["nodes"])}
    connections = workflow.get("connections", [])
    trigger_nodes = [nid for nid, node in nodes.items() if node["type"].endswith("TriggerNode")]
    if not trigger_nodes:
        trigger_nodes = [list(nodes.keys())[0]]
    queue = [(nid, input_data) for nid in trigger_nodes]
    results = {}
    while queue:
        nid, data = queue.pop(0)
        node_def = nodes[nid]
        NodeClass = get_node_class(node_def["type"])
        node = NodeClass(node_def.get("config", {}), node_def.get("credentials", {}))
        # Retry logic
        for attempt in range(MAX_RETRIES):
            try:
                result = await node.execute(data)
                if result.get("status") == "SUCCESS":
                    results[nid] = result["data"]
                    break
                else:
                    if attempt == MAX_RETRIES - 1:
                        if db and job_id:
                            await db.executions.update_one({"job_id": job_id}, {"$set": {"status": "FAILED", "error": result.get("error")}})
                        return {"error": result.get("error"), "node": nid}
            except RETRYABLE_ERRORS as e:
                if attempt == MAX_RETRIES - 1:
                    if db and job_id:
                        await db.executions.update_one({"job_id": job_id}, {"$set": {"status": "FAILED", "error": str(e)}})
                    return {"error": str(e), "node": nid}
                await asyncio.sleep(1)
            except Exception as e:
                if db and job_id:
                    await db.executions.update_one({"job_id": job_id}, {"$set": {"status": "FAILED", "error": str(e)}})
                return {"error": str(e), "node": nid}
        outgoing = [c for c in connections if c["source"] == nid]
        for conn in outgoing:
            cond = conn.get("conditions")
            if cond:
                field = cond.get("field")
                equals = cond.get("equals")
                val = results[nid]
                for part in field.split(".")[1:]:
                    val = val.get(part)
                if val != equals:
                    continue
            queue.append((conn["target"], results[nid]))
    return results 