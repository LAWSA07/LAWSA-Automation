# Enhanced LAWSA Workflow System

## 🚀 Overview

This enhanced system provides a complete no-code workflow automation platform with visual workflow editing, AI agent execution, and comprehensive tool integration. The system consists of two main components:

- **Frontend**: Modern Next.js application with React Flow workflow editor
- **Backend**: FastAPI-based Python backend with LangGraph agent execution

## 🏗️ Architecture

### Frontend (landingpaden8n/)
- **Framework**: Next.js 14 with App Router
- **UI**: React Flow for workflow canvas, Tailwind CSS for styling
- **State Management**: React hooks and context
- **Features**: Drag & drop workflow editing, node configuration, real-time execution

### Backend (n8n_minimal/)
- **Framework**: FastAPI with async support
- **AI Engine**: LangGraph for agent execution
- **LLM Integration**: Multiple providers (OpenAI, Anthropic, Groq, etc.)
- **Database**: MongoDB for persistence
- **Authentication**: JWT-based auth system

## 🎯 Key Features

### Workflow Editor
- **Visual Design**: Drag & drop interface with React Flow
- **Node Types**: Triggers, AI agents, Tools, Outputs
- **Configuration**: Rich node configuration panels
- **Validation**: Real-time workflow validation
- **Export/Import**: JSON workflow format

### AI Capabilities
- **Multiple LLM Providers**: OpenAI, Anthropic, Groq, Together AI, Cohere, Mistral
- **Tool Integration**: Web search, email, Slack, HTTP requests, database operations
- **Memory Systems**: Window buffer, MongoDB, SQLite, PostgreSQL
- **Streaming Execution**: Real-time workflow execution with progress updates

### Node Types

#### Triggers
- **Input**: Manual workflow triggers
- **Webhook**: HTTP webhook triggers
- **Schedule**: Time-based triggers (cron expressions)

#### AI
- **Agentic**: Main AI agent nodes
- **LLM**: Language model integration
- **Memory**: Context storage and retrieval

#### Tools
- **Tool**: External integrations (search, email, etc.)
- **HTTP**: API request nodes
- **Email**: Email sending capabilities

#### Outputs
- **Output**: Final result formatting
- **Slack**: Slack notifications
- **Database**: Data storage operations

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or cloud)

### Frontend Setup
```bash
cd landingpaden8n
npm install
npm run dev
```

### Backend Setup
```bash
cd n8n_minimal
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run the backend
uvicorn src.main:app --reload
```

### Environment Variables
```bash
# Backend (.env)
SECRET_KEY=your-secret-key
GROQ_API_KEY=your-groq-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
TAVILY_API_KEY=your-tavily-key
MONGODB_URI=your-mongodb-uri
GMAIL_USER=your-email
GMAIL_APP_PASSWORD=your-app-password
SLACK_WEBHOOK_URL=your-slack-webhook
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/{id}` - Get workflow
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow

### Execution
- `POST /execute-agent` - Execute workflow with streaming
- `POST /api/validate-workflow` - Validate workflow
- `GET /api/models` - Get available models
- `GET /api/tools` - Get available tools
- `GET /api/providers` - Get LLM providers

### Credentials
- `GET /api/credentials` - List credentials
- `POST /api/credentials` - Create credential
- `PUT /api/credentials/{id}` - Update credential
- `DELETE /api/credentials/{id}` - Delete credential

## 🎨 Frontend Components

### Core Components
- `WorkflowEditor.tsx` - Main workflow canvas
- `Sidebar.tsx` - Node palette and search
- `CustomNode.tsx` - Custom node rendering
- `NodeConfigPanel.tsx` - Node configuration interface

### Features
- **Drag & Drop**: Create nodes from sidebar
- **Node Configuration**: Click nodes to configure
- **Real-time Execution**: Stream workflow results
- **Workflow Validation**: Check for errors before execution
- **Export/Import**: Save and load workflows

## 🔧 Backend Components

### Core Modules
- `main.py` - FastAPI application and endpoints
- `agent/builder.py` - LangGraph workflow builder
- `agent/components.py` - LLM and tool registries
- `schemas.py` - Pydantic data models
- `engine.py` - Workflow execution engine

### Features
- **Dynamic Graph Building**: Convert visual workflows to executable graphs
- **Multi-Provider Support**: Multiple LLM providers
- **Tool Integration**: Rich set of pre-built tools
- **Memory Systems**: Various memory backends
- **Streaming Execution**: Real-time workflow progress

## 🔄 Workflow Execution Flow

1. **Frontend**: User designs workflow visually
2. **Validation**: Backend validates workflow structure
3. **Graph Building**: Convert to LangGraph StateGraph
4. **Execution**: Stream results back to frontend
5. **Monitoring**: Real-time progress and error handling

## 🎯 Node Configuration

### LLM Nodes
```json
{
  "provider": "groq",
  "model": "llama3-8b-8192",
  "temperature": 0.7,
  "max_tokens": 1000,
  "api_key": "your-api-key"
}
```

### Tool Nodes
```json
{
  "tool_type": "tavily_search",
  "config": {
    "search_depth": "basic"
  },
  "api_key": "your-api-key"
}
```

### Memory Nodes
```json
{
  "type": "sqlite",
  "config": {
    "database_path": "./memory.db"
  }
}
```

## 🚀 Getting Started

### 1. Start Both Services
```bash
# Terminal 1 - Frontend
cd landingpaden8n
npm run dev

# Terminal 2 - Backend
cd n8n_minimal
uvicorn src.main:app --reload
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backflow Editor**: http://localhost:3000/workflow
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Create Your First Workflow
1. Navigate to the workflow editor
2. Drag nodes from the sidebar
3. Connect nodes with edges
4. Configure node settings
5. Run the workflow

## 🔧 Development

### Adding New Node Types
1. **Frontend**: Add to `Sidebar.tsx` node categories
2. **Backend**: Add to `schemas.py` NodeType enum
3. **Backend**: Implement in `agent/builder.py`
4. **Backend**: Add to `agent/components.py` if needed

### Adding New Tools
1. **Backend**: Add tool function to `agent/components.py`
2. **Backend**: Register in `TOOL_REGISTRY`
3. **Frontend**: Add to `NodeConfigPanel.tsx` tool options

### Adding New LLM Providers
1. **Backend**: Add provider to `agent/components.py`
2. **Backend**: Add models to `AVAILABLE_MODELS`
3. **Frontend**: Add to `NodeConfigPanel.tsx` provider options

## 🧪 Testing

### Frontend Testing
```bash
cd landingpaden8n
npm test
```

### Backend Testing
```bash
cd n8n_minimal
python -m pytest tests/
```

### API Testing
```bash
# Test workflow execution
curl -X POST http://localhost:8000/execute-agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "graph": {
      "name": "Test Workflow",
      "nodes": [...],
      "edges": [...]
    },
    "input": "Hello, world!",
    "thread_id": "test-thread"
  }'
```

## 📊 Monitoring & Logging

### Backend Logging
- Structured logging with different levels
- Execution tracking and error reporting
- Performance metrics collection

### Frontend Monitoring
- Real-time execution status
- Error handling and user feedback
- Workflow validation results

## 🔒 Security

### Authentication
- JWT-based authentication
- Secure credential storage
- API key encryption

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Frontend Deployment
```bash
cd landingpaden8n
npm run build
npm start
```

### Backend Deployment
```bash
cd n8n_minimal
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub discussions for questions

## 🎉 What's New in This Enhanced Version

### Frontend Enhancements
- ✅ Node configuration panels
- ✅ Real-time workflow execution
- ✅ Better error handling
- ✅ Improved UI/UX
- ✅ Workflow validation
- ✅ Export/Import functionality

### Backend Enhancements
- ✅ Enhanced schemas with enums
- ✅ Multiple LLM provider support
- ✅ Rich tool integration
- ✅ Memory system support
- ✅ Workflow validation
- ✅ Streaming execution
- ✅ Better error handling

### Integration Improvements
- ✅ Standardized data formats
- ✅ Real-time communication
- ✅ Better API design
- ✅ Comprehensive documentation

This enhanced system provides a complete, production-ready workflow automation platform with modern UI/UX and robust backend capabilities.
