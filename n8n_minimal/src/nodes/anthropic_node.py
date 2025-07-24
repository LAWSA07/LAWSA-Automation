from ..node_base import Node
from typing import Any, Dict
import httpx
from ..config import ANTHROPIC_API_KEY

class AnthropicNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        prompt = self.config["prompt"]
        url = "https://api.anthropic.com/v1/complete"
        headers = {
            "x-api-key": ANTHROPIC_API_KEY,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        payload = {
            "model": self.config.get("model", "claude-2"),
            "prompt": prompt,
            "max_tokens_to_sample": self.config.get("max_tokens", 256),
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            return [{"json": response.json()}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "AnthropicNode",
            "description": "Calls Anthropic Claude API for text generation.",
        } 