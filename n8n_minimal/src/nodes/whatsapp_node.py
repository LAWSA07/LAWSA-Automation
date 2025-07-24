from ..node_base import Node
from typing import Any, Dict
import httpx

class WhatsAppNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        access_token = self.config["access_token"]
        phone_number_id = self.config["phone_number_id"]
        recipient = self.config["recipient"]
        message = self.config["message"]
        url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        payload = {
            "messaging_product": "whatsapp",
            "to": recipient,
            "type": "text",
            "text": {"body": message}
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            try:
                return [{"json": response.json()}]
            except Exception:
                return [{"json": {"error": response.text}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "WhatsAppNode",
            "description": "Sends a message via WhatsApp Cloud API.",
        } 