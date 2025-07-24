from ..node_base import Node
from typing import Any, Dict
import httpx
import logging
import os

class SlackNode(Node):
    async def execute(self, inputs: Any = None, options: Dict[str, Any] = None) -> Any:
        token = self.config["token"]
        channel = self.config["channel"]
        message = self.config.get("message", "")
        mrkdwn = self.config.get("mrkdwn", True)
        blocks = self.config.get("blocks")  # Optional: Slack blocks for rich formatting
        file_path = self.config.get("file_path")  # Optional: path to file to upload
        file_title = self.config.get("file_title", "Uploaded File")
        results = []
        headers = {"Authorization": f"Bearer {token}"}
        # 1. Send message with optional blocks
        if message or blocks:
            url = "https://slack.com/api/chat.postMessage"
            payload = {"channel": channel, "text": message, "mrkdwn": mrkdwn}
            if blocks:
                payload["blocks"] = blocks
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, json=payload, headers={**headers, "Content-Type": "application/json"})
                    data = response.json()
                    if not data.get("ok"):
                        logging.error(f"Slack API error: {data}")
                        results.append({"json": {"status": "FAILED", "error": data.get("error", "Unknown error"), "response": data}})
                    else:
                        logging.info(f"Slack message sent: {data}")
                        results.append({"json": {"status": "SUCCESS", "ts": data.get("ts"), "channel": channel}})
            except Exception as e:
                logging.exception("SlackNode message send failed")
                results.append({"json": {"status": "FAILED", "error": str(e)}})
        # 2. Upload file if specified
        if file_path and os.path.exists(file_path):
            url = "https://slack.com/api/files.upload"
            try:
                with open(file_path, "rb") as f:
                    files = {"file": (os.path.basename(file_path), f)}
                    data = {"channels": channel, "title": file_title}
                    async with httpx.AsyncClient() as client:
                        response = await client.post(url, data=data, files=files, headers=headers)
                        data = response.json()
                        if not data.get("ok"):
                            logging.error(f"Slack file upload error: {data}")
                            results.append({"json": {"status": "FAILED", "error": data.get("error", "Unknown error"), "response": data}})
                        else:
                            logging.info(f"Slack file uploaded: {data}")
                            results.append({"json": {"status": "SUCCESS", "file_id": data.get("file", {}).get("id"), "channel": channel}})
            except Exception as e:
                logging.exception("SlackNode file upload failed")
                results.append({"json": {"status": "FAILED", "error": str(e)}})
        elif file_path:
            results.append({"json": {"status": "FAILED", "error": f"File not found: {file_path}"}})
        return results if results else [{"json": {"status": "NO_ACTION"}}]

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            "name": "SlackNode",
            "description": "Sends a message or uploads a file to a Slack channel. Supports Markdown, blocks, file upload, and robust error handling.",
        } 