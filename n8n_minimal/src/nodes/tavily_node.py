from ..node_base import Node
from typing import Any, Dict
import httpx
from ..config import TAVILY_API_KEY

class TavilyNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        query = self.config["query"]
        url = "https://api.tavily.com/search"
        
        # Prefer user-provided API key, fall back to environment variable
        api_key = self.config.get("api_key") or TAVILY_API_KEY
        if not api_key:
            raise ValueError("Tavily API key is required. Please provide it in the node config or set TAVILY_API_KEY environment variable.")
        
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
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