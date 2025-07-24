# Product Requirements Document (PRD)

## Product Name
**lawsa Minimalist Automation Platform – Frontend**

---

## 1. Purpose

The frontend is a modern, minimalist, web-based interface for the lawsa automation platform. It enables users to register, log in, design, configure, and execute workflow automations visually, with a focus on simplicity, usability, and seamless integration with the backend.

---

## 2. Target Users

- **Automation Engineers**
- **Business Analysts**
- **Technical End Users**
- **Developers**

---

## 3. Key Features

### 3.1. Authentication

- **User Registration**
  - Email and password registration form.
  - Password strength validation.
  - Error handling for duplicate emails, weak passwords, and server errors.
- **User Login**
  - Email and password login form.
  - JWT-based authentication.
  - Error handling for invalid credentials.
- **Session Management**
  - Store JWT in localStorage.
  - Auto-redirect to login on session expiration or logout.
  - Logout button on all protected pages.

---

### 3.2. Home & Navigation

- **Home Page**
  - Minimalist black/white design.
  - Tagline and “Get Started” button.
  - Navigation to Register/Login.
- **Navigation**
  - Route-based navigation using React Router.
  - Protected routes for workflow/automation pages.

---

### 3.3. Workflow Editor

- **Visual Workflow Canvas**
  - Drag-and-drop node editor (using React Flow or similar).
  - Pan and zoom support.
  - Snap-to-grid for node alignment.
- **Node Types**
  - Input node
  - Agentic node
  - Tool node (with credential selection)
  - Memory node
  - Output node
- **Node Configuration**
  - Modal or side panel for editing node properties.
  - Dynamic form fields based on node type.
  - Credential selection for tool nodes.
- **Edge/Connection Management**
  - Connect nodes visually.
  - Validate allowed connections (e.g., no cycles, input/output rules).
  - Custom edge rendering.
- **Node/Edge Actions**
  - Add, move, delete nodes and edges.
  - Context menu for node/edge actions.

---

### 3.4. Workflow Management

- **Create, Save, Load Workflows**
  - Save workflows to backend (with name, description, metadata).
  - Load and edit existing workflows.
  - List all workflows for the user.
- **Templates**
  - Create and use workflow templates.
  - List and load templates.

---

### 3.5. Execution & Output

- **Run Workflow**
  - “Run” button to execute the current workflow.
  - Show real-time streaming output/results.
  - Display errors and execution logs.
- **Execution History**
  - List past executions with status and logs.
  - View details of each execution.

---

### 3.6. Credentials Management

- **Credential Modal**
  - Add, edit, delete credentials (API keys, passwords, etc.).
  - Secure storage and retrieval via backend.
  - Assign credentials to tool nodes.
- **Credential Validation**
  - Validate credential format before saving.
  - Show error messages for invalid credentials.

---

### 3.7. User Experience & Design

- **Minimalist, Responsive UI**
  - Black/white color scheme.
  - Centered card layouts for forms.
  - Responsive design for desktop and mobile.
- **Accessibility**
  - Keyboard navigation for all controls.
  - Sufficient color contrast.
- **Error Handling**
  - User-friendly error messages for all API and validation errors.
  - Loading indicators for async actions.

---

## 4. Technical Requirements

- **Framework:** React (with TypeScript preferred)
- **State Management:** React hooks, Context API (or Redux if needed)
- **Routing:** React Router
- **API Integration:** Fetch or Axios, JWT in Authorization header
- **Component Library:** Custom minimalist components, optionally Tailwind or Material UI for rapid prototyping
- **Testing:** Unit and integration tests for components and flows (Jest, React Testing Library)
- **Build Tool:** Vite

---

## 5. Non-Functional Requirements

- **Performance:** Fast load and interaction times, optimized bundle size.
- **Security:** No sensitive data in client logs; credentials handled securely.
- **Scalability:** Modular codebase for easy feature addition.
- **Maintainability:** Well-documented code and clear component structure.

---

## 6. Out of Scope

- Social login (Google, GitHub, etc.)
- Multi-tenant user management (for now)
- Advanced analytics/dashboarding

---

## 7. Success Metrics

- Users can register, log in, and access the workflow editor.
- Users can visually create, save, and execute workflows.
- Users can manage credentials and assign them to nodes.
- All major actions are possible from a modern, minimalist UI.

---

## 8. Future Enhancements

- Team/multi-user collaboration
- Workflow versioning and sharing
- Advanced analytics and reporting
- Marketplace for workflow templates 