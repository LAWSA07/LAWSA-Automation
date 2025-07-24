from ..node_base import Node
from typing import Any, Dict
import httpx

class HttpRequestNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        method = self.config.get("method", "GET")
        url = self.config["url"]
        headers = self.config.get("headers", {})
        data = self.config.get("data", None)
        async with httpx.AsyncClient() as client:
            response = await client.request(method, url, headers=headers, data=data)
            return [{"json": response.json()}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "HttpRequestNode",
            "description": "Performs an HTTP request and returns the response.",
        } 