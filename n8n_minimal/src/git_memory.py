import hashlib
import json
import os
from typing import Any, Dict, Optional, List

MEMORY_DIR = "agent_memory"
os.makedirs(MEMORY_DIR, exist_ok=True)

def _hash_content(content: Any) -> str:
    data = json.dumps(content, sort_keys=True).encode()
    return hashlib.sha256(data).hexdigest()

def save_state(state: Dict) -> str:
    hash_ = _hash_content(state)
    path = os.path.join(MEMORY_DIR, f"{hash_}.json")
    with open(path, "w") as f:
        json.dump(state, f)
    return hash_

def get_state(hash_: str) -> Optional[Dict]:
    path = os.path.join(MEMORY_DIR, f"{hash_}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)

def list_states() -> List[str]:
    return [f[:-5] for f in os.listdir(MEMORY_DIR) if f.endswith(".json")] 