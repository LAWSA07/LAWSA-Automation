from ..node_base import Node
from typing import Any, Dict

class WebhookTriggerNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        # In a real system, this would be triggered by an HTTP request
        # For MVP, just return a webhook event payload
        return [{"json": {"webhook": True}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "WebhookTriggerNode",
            "description": "Triggers workflow on incoming webhook.",
        } 