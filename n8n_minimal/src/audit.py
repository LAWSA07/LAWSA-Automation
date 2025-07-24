import json
from datetime import datetime

def log_audit_action(user: str, action: str, details: dict):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user": user,
        "action": action,
        "details": details
    }
    with open("audit.log", "a") as f:
        f.write(json.dumps(entry) + "\n") 