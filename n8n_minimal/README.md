# n8n(minimal) Dynamic Agentic Backend

## Overview
This backend powers a no-code, agentic automation platform. Users visually design workflows in the frontend; the backend dynamically builds and executes agentic systems (using LangGraph/LangChain) based on those workflows—no user code required.

## Features
- Visual workflow to executable agent translation
- Dynamic LLM and tool selection (Groq, OpenAI, Anthropic, Tavily, etc.)
- Secure credential management
- Asynchronous execution and streaming results
- Extensible: add new tools/LLMs easily

## Setup

### 1. Clone the repository
```
git clone <your-repo-url>
cd n8n(minimal)
```

### 2. Install dependencies
```
pip install -r requirements.txt
```

### 3. Environment variables
Create a `.env` file in `n8n(minimal)/` with your API keys and secrets:
```
SECRET_KEY=your-fernet-key
GROQ_API_KEY=your-groq-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
TAVILY_API_KEY=your-tavily-key
MONGODB_URI=your-mongodb-uri
```

### 4. Run the backend
```
uvicorn src.main:app --reload
```

## API Endpoints
- `/execute-agent`: POST a workflow graph and input, receive streamed agent output (SSE)
- `/health`: Health check

## Architecture
- **schemas.py**: Pydantic models for workflow graphs
- **agent/components.py**: Registries for LLMs and tools
- **agent/builder.py**: Dynamic graph builder for LangGraph
- **main.py**: FastAPI app, endpoints, and streaming logic

## Extending
- Add new tools/LLMs to `agent/components.py`
- Add new node types to the frontend and backend schema

## License
MIT 

## Example Workflow (with Branching)

```json
{
  "nodes": [
    {"id": "1", "type": "ManualTriggerNode", "config": {}},
    {"id": "2", "type": "CodeNode", "config": {"code": "result = {'value': 1}"}},
    {"id": "3", "type": "CodeNode", "config": {"code": "result = {'msg': 'Branch A'}"}},
    {"id": "4", "type": "CodeNode", "config": {"code": "result = {'msg': 'Branch B'}"}}
  ],
  "connections": [
    {"source": "1", "target": "2"},
    {"source": "2", "target": "3", "conditions": {"field": "json.value", "equals": 1}},
    {"source": "2", "target": "4", "conditions": {"field": "json.value", "equals": 2}}
  ]
}
```

## API Usage

### Authentication
- Register: `POST /auth/register`
- Login: `POST /auth/login` (returns JWT)

### Workflows
- Create: `POST /workflows/` (JWT required)
- List: `GET /workflows/` (JWT required)
- Get: `GET /workflows/{id}` (JWT required)
- Update: `PUT /workflows/{id}` (JWT required)
- Delete: `DELETE /workflows/{id}` (JWT required)

### Executions
- Log: `POST /executions/` (JWT required)
- List: `GET /executions/` (JWT required)
- Get: `GET /executions/{id}` (JWT required)

### Credentials
- Create: `POST /credentials/` (JWT required)
- List: `GET /credentials/` (JWT required)
- Get: `GET /credentials/{id}` (JWT required)
- Update: `PUT /credentials/{id}` (JWT required)
- Delete: `DELETE /credentials/{id}` (JWT required)

### Workflow Execution
- Execute: `POST /workflows/execute/{workflow_id}` (JWT required)
- Schedule: `POST /workflows/schedule/{workflow_id}` (JWT required)
- Webhook: `POST /webhook/{workflow_id}` 