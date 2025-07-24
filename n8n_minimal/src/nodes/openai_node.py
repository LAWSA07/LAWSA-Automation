from ..node_base import Node
from typing import Any, Dict
import httpx
from ..config import OPENAI_API_KEY

class OpenAINode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        prompt = self.config["prompt"]
        url = "https://api.openai.com/v1/completions"
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": self.config.get("model", "text-davinci-003"),
            "prompt": prompt,
            "max_tokens": self.config.get("max_tokens", 256),
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            return [{"json": response.json()}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "OpenAINode",
            "description": "Calls OpenAI API for text generation.",
        } 