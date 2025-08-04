# Product Specification: No-Code Agentic Automation Platform

## 1. Product Overview
A dynamic, no-code automation platform inspired by n8n, enabling users to visually design, configure, and execute complex agentic workflows. The system leverages LangGraph and LangChain to construct and run agentic systems, supporting integration with multiple LLM providers, tools, and secure credential management.

## 2. Problem Statement
Non-technical users and automation engineers need a way to build, test, and deploy advanced agentic workflows without writing code. Existing solutions are either too rigid or require programming knowledge. This platform democratizes agentic automation by providing a visual, drag-and-drop interface and a dynamic backend that translates user intent into executable agentic systems.

## 3. Key Features
- **Visual Workflow Editor**: Drag-and-drop node-based UI using React Flow.
- **Dynamic Agentic Backend**: Translates frontend workflows into LangGraph/LangChain agents.
- **Credential Management**: Secure storage and validation using Fernet encryption.
- **Multi-Provider LLM Support**: Integrations for OpenAI, Groq, Anthropic, Together, etc.
- **Tool and Memory Integration**: Add tools, memory, and custom logic as nodes.
- **Real-Time Streaming**: Server-Sent Events for live agent output.
- **Validation & Error Handling**: Robust frontend/backend validation and feedback.
- **Authentication & Authorization**: JWT-based user management.
- **Dynamic MongoDB Connection**: Secure, runtime-configurable database connections.
- **Production-Ready Security**: CORS, secrets management, and rate limiting (optional).

## 4. User Stories
- As a user, I can visually design workflows by connecting nodes representing triggers, LLMs, tools, and memory.
- As a user, I can securely store and validate API keys and credentials.
- As a user, I can execute workflows and see real-time results.
- As an admin, I can manage users and control access to workflows and credentials.
- As a developer, I can extend the platform with new node types and integrations.

## 5. Technical Requirements
- **Frontend**: React, React Flow, TanStack Query, custom node components, error handling, and validation UI.
- **Backend**: FastAPI, LangGraph, LangChain, modular architecture, dependency injection, Fernet encryption, MongoDB, JWT auth, CORS, and streaming endpoints.
- **Testing**: Pytest for backend, TestSprite for automated test coverage.
- **DevOps**: GitHub secret scanning, .env management, and clean repository practices.

## 6. Acceptance Criteria
- Users can create, connect, and configure nodes in the frontend.
- Backend dynamically builds and executes agentic workflows based on frontend input.
- Credentials are encrypted and validated before use.
- Real-time execution results are streamed to the frontend.
- No secrets are present in the repository or git history.
- System is ready for production deployment with security best practices.

## 7. Out of Scope
- Docker/containerization (for now)
- Advanced analytics and monitoring
- Marketplace for third-party nodes (future)

## 8. Future Enhancements
- Containerized deployment
- Node marketplace and plugin system
- Advanced analytics and workflow monitoring
- Team collaboration features

---

*This document serves as the foundation for development, testing, and deployment of the no-code agentic automation platform.* 

# Backend API Detailed Specification

## TC001: POST /execute-agent - Stream Agentic Workflow Results
- **Endpoint:** /execute-agent
- **Method:** POST
- **Description:** Streams agentic workflow execution results as Server-Sent Events in real-time based on the provided workflow definition.
- **Expected Behavior:**
  - Accepts a valid workflow definition in the request body.
  - Executes the workflow using LangGraph/LangChain.
  - Streams output tokens/events to the client as SSE.
  - Returns errors in SSE stream if execution fails.
- **Authentication:** Required (JWT Bearer)
- **Validation:** Workflow definition must be valid JSON and conform to schema.
- **Error Handling:** Returns 400 for invalid input, 401 for unauthorized, 500 for execution errors.
- **Security:** Only authenticated users can execute workflows. Input is sanitized.

## TC002: GET /api/credentials - Retrieve Encrypted Credentials
- **Endpoint:** /api/credentials
- **Method:** GET
- **Description:** Returns a list of encrypted credentials for the authenticated user.
- **Expected Behavior:**
  - Returns all credentials belonging to the user, with sensitive fields encrypted.
- **Authentication:** Required (JWT Bearer)
- **Validation:** N/A
- **Error Handling:** 401 for unauthorized, 500 for server errors.
- **Security:** Only the user's own credentials are returned. No plaintext secrets.

## TC003: POST /api/credentials - Add/Update Credential
- **Endpoint:** /api/credentials
- **Method:** POST
- **Description:** Adds or updates a credential with validation and encryption.
- **Expected Behavior:**
  - Validates credential fields (name, type, data).
  - Encrypts sensitive data before storing.
  - Returns success or validation error message.
- **Authentication:** Required (JWT Bearer)
- **Validation:** All required fields must be present and valid.
- **Error Handling:** 400 for validation errors, 401 for unauthorized, 500 for server errors.
- **Security:** No secrets stored in plaintext. Only owner can update.

## TC004: DELETE /api/credentials/{credentialId} - Remove Credential
- **Endpoint:** /api/credentials/{credentialId}
- **Method:** DELETE
- **Description:** Deletes the specified credential by ID.
- **Expected Behavior:**
  - Removes the credential if it exists and belongs to the user.
  - Returns 204 No Content on success.
- **Authentication:** Required (JWT Bearer)
- **Validation:** CredentialId must be valid and owned by user.
- **Error Handling:** 404 if not found, 401 for unauthorized, 500 for server errors.
- **Security:** Only owner can delete. No data leakage.

## TC005: GET /api/tools - List Tool Configurations
- **Endpoint:** /api/tools
- **Method:** GET
- **Description:** Returns a list of available tools and their configurations (e.g., tavily_search, multiply, send_email, post_to_slack).
- **Expected Behavior:**
  - Returns all supported tool types and their config schemas.
- **Authentication:** Required (JWT Bearer)
- **Validation:** N/A
- **Error Handling:** 401 for unauthorized, 500 for server errors.
- **Security:** No sensitive data returned.

## TC006: POST /api/workflows - Submit Workflow
- **Endpoint:** /api/workflows
- **Method:** POST
- **Description:** Accepts new or updated workflow JSON configurations.
- **Expected Behavior:**
  - Validates and stores the workflow for the user.
  - Returns success or error message.
- **Authentication:** Required (JWT Bearer)
- **Validation:** Workflow JSON must conform to schema.
- **Error Handling:** 400 for invalid input, 401 for unauthorized, 500 for server errors.
- **Security:** Only owner can create/update their workflows.

## TC007: POST /api/users/login - User Login
- **Endpoint:** /api/users/login
- **Method:** POST
- **Description:** Authenticates user with username and password, returns JWT token on success.
- **Expected Behavior:**
  - Validates credentials.
  - Returns JWT token if valid, error if not.
- **Authentication:** N/A (login endpoint)
- **Validation:** Username and password required.
- **Error Handling:** 400 for missing fields, 401 for invalid credentials.
- **Security:** Rate limiting, no sensitive info in error messages.

## TC008: POST /api/users/logout - User Logout
- **Endpoint:** /api/users/logout
- **Method:** POST
- **Description:** Invalidates the JWT token and logs out the user.
- **Expected Behavior:**
  - Invalidates the user's session/token.
  - Returns success message.
- **Authentication:** Required (JWT Bearer)
- **Validation:** N/A
- **Error Handling:** 401 for unauthorized, 500 for server errors.
- **Security:** Token is blacklisted or expired. 