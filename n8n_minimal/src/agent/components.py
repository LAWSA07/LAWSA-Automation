from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.tools import tool
from langchain_tavily import TavilySearch
import smtplib
import os
import requests
from email.mime.text import MIMEText

# --- Tool Registry ---

@tool
def multiply(a: int, b: int) -> int:
    """Multiply two integers."""
    return a * b

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email using Gmail SMTP."""
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.environ.get("GMAIL_USER")
    sender_password = os.environ.get("GMAIL_APP_PASSWORD")
    if not sender_email or not sender_password:
        return "Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variable."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [to], msg.as_string())
        return f"Email sent to {to} with subject '{subject}'"
    except Exception as e:
        return f"Failed to send email: {e}"

@tool
def post_to_slack(channel: str, message: str) -> str:
    """Post a message to a Slack channel (dummy implementation)."""
    print(f"Posting to Slack channel {channel}: {message}")
    return f"Message posted to Slack channel {channel}"

TOOL_REGISTRY = {
    "tavily_search": TavilySearch(max_results=2),
    "multiply": multiply,
    "send_email": send_email,
    "post_to_slack": post_to_slack,
}

# --- LLM Registry ---

LLM_REGISTRY = {
    "groq": ChatGroq,
    "openai": ChatOpenAI,
    "anthropic": ChatAnthropic,
} 