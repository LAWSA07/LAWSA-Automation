from ..node_base import Node
from typing import Any, Dict

class CodeNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        code = self.config.get("code", "")
        # Restricted globals for safety
        restricted_globals = {"__builtins__": {"range": range, "len": len, "str": str, "int": int, "float": float, "dict": dict, "list": list}}
        local_vars = {"inputs": inputs}
        try:
            exec(code, restricted_globals, local_vars)
            result = local_vars.get("result", None)
            return [{"json": result}]
        except Exception as e:
            return [{"json": {"error": str(e)}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "CodeNode",
            "description": "Executes custom Python code in a restricted environment.",
        } 