from ..node_base import Node
from typing import Any, Dict
import httpx
import base64

class GmailNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        access_token = self.config["access_token"]
        to = self.config["to"]
        subject = self.config["subject"]
        body = self.config["body"]
        message = f"From: me\nTo: {to}\nSubject: {subject}\n\n{body}"
        encoded_message = base64.urlsafe_b64encode(message.encode()).decode()
        url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        payload = {"raw": encoded_message}
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            try:
                return [{"json": response.json()}]
            except Exception:
                return [{"json": {"error": response.text}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "GmailNode",
            "description": "Sends an email via Gmail API (OAuth2 required).",
        } 