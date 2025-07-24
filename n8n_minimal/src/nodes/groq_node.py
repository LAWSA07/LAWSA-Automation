from ..node_base import Node
from typing import Any, Dict
import httpx
from ..config import GROQ_API_KEY

class GroqNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        prompt = self.config["prompt"]
        url = "https://api.groq.com/v1/completions"
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": self.config.get("model", "mixtral-8x7b-32768"),
            "prompt": prompt,
            "max_tokens": self.config.get("max_tokens", 256),
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                return {"status": "SUCCESS", "data": response.json()}
        except Exception as e:
            return {"status": "FAILED", "error": str(e)}

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "GroqNode",
            "description": "Calls Groq LLM API for text generation.",
        } 