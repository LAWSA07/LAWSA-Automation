from ..node_base import Node
from typing import Any, Dict

class ScheduleTriggerNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        # In a real system, this would register a job with APScheduler
        # For MVP, just return a scheduled event payload
        return [{"json": {"scheduled": True}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "ScheduleTriggerNode",
            "description": "Triggers workflow on a schedule (cron/interval).",
        } 