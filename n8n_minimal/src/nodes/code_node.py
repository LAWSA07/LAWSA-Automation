from ..node_base import Node
from typing import Any, Dict
from ..sandbox import run_in_sandbox

class CodeNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        code = self.config["code"]
        input_vars = inputs or {}
        result = run_in_sandbox(code, input_vars)
        if "error" in result:
            return [{"json": {"error": result["error"]}}]
        return [{"json": {"result": result["result"]}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "CodeNode",
            "description": "Executes custom Python code in a restricted environment.",
        } 