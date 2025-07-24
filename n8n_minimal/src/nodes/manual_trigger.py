from ..node_base import Node
from typing import Any, Dict

class ManualTriggerNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        # For manual trigger, just return a default payload or pass through inputs
        return [{"json": {"triggered": True}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "ManualTriggerNode",
            "description": "Triggers workflow manually for testing.",
        } 