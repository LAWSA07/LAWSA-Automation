from typing import Any, Dict

class Node:
    def __init__(self, config: Dict[str, Any], credentials: Dict[str, Any] = None):
        self.config = config
        self.credentials = credentials or {}

    async def execute(self, inputs: Any, options: Dict[str, Any] = None) -> Any:
        """
        Should return a status object:
        { 'status': 'SUCCESS', 'data': ... } or { 'status': 'FAILED', 'error': ... }
        """
        raise NotImplementedError("Each node must implement the execute method.")

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": self.__class__.__name__,
            "description": "",
        } 