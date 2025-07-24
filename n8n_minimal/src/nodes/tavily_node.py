from ..node_base import Node
from typing import Any, Dict
import httpx
from ..config import TAVILY_API_KEY

class TavilyNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        query = self.config["query"]
        url = "https://api.tavily.com/search"
        headers = {"Authorization": f"Bearer {TAVILY_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "query": query,
            "num_results": self.config.get("num_results", 3),
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            return [{"json": response.json()}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "TavilyNode",
            "description": "Calls Tavily API for search results.",
        } 