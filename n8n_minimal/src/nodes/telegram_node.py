from ..node_base import Node
from typing import Any, Dict
import httpx

class TelegramNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        bot_token = self.config["bot_token"]
        chat_id = self.config["chat_id"]
        message = self.config["message"]
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {"chat_id": chat_id, "text": message}
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return [{"json": response.json()}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "TelegramNode",
            "description": "Sends a message via Telegram Bot API.",
        } 