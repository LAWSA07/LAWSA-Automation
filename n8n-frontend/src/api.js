// Set the API base URL for backend communication
export const API_BASE_URL = 'http://localhost:8000'; // Change if your backend runs elsewhere

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const errorMsg = (data && (data.detail || data.message)) || res.statusText || 'Unknown error';
    throw new Error(errorMsg);
  }
  return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem('lawsa_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API = {
  async saveWorkflow(workflow) {
    const res = await fetch(`${API_BASE_URL}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(workflow),
    });
    return handleResponse(res);
  },
  async listWorkflows() {
    const res = await fetch(`${API_BASE_URL}/workflows`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  async getWorkflow(id) {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  async executeWorkflow(id) {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}/execute`, { method: 'POST', headers: getAuthHeaders() });
    return handleResponse(res);
  },
  async getExecution(id) {
    const res = await fetch(`${API_BASE_URL}/executions/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  async createCredential(name, type, data) {
    // Fix: use 'type' instead of 'type_' in the request body
    const res = await fetch(`${API_BASE_URL}/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ name, type, data }),
    });
    return handleResponse(res);
  },
  async listCredentials() {
    const res = await fetch(`${API_BASE_URL}/credentials`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  async getCredential(id) {
    const res = await fetch(`${API_BASE_URL}/credentials/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  async createProject(project) {
    const res = await fetch(`${API_BASE_URL}/workflows/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return handleResponse(res);
  },
  async listProjects() {
    const res = await fetch(`${API_BASE_URL}/workflows/projects`);
    return handleResponse(res);
  },
  async getProject(id) {
    const res = await fetch(`${API_BASE_URL}/workflows/projects/${id}`);
    return handleResponse(res);
  },
  async updateProject(id, project) {
    const res = await fetch(`${API_BASE_URL}/workflows/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return handleResponse(res);
  },
  async deleteProject(id) {
    const res = await fetch(`${API_BASE_URL}/workflows/projects/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },
  async createTemplate(name, description, workflow) {
    const res = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, workflow }),
    });
    return handleResponse(res);
  },
  async listTemplates() {
    const res = await fetch(`${API_BASE_URL}/templates`);
    return handleResponse(res);
  },
  async getTemplate(id) {
    const res = await fetch(`${API_BASE_URL}/templates/${id}`);
    return handleResponse(res);
  },
  async deleteTemplate(id) {
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },
  async updateTemplate(id, name, description, workflow) {
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, workflow }),
    });
    return handleResponse(res);
  },
  async createVariable(key, value) {
    const res = await fetch(`${API_BASE_URL}/variables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    return handleResponse(res);
  },
  async listVariables() {
    const res = await fetch(`${API_BASE_URL}/variables`);
    return handleResponse(res);
  },
  async updateVariable(key, value) {
    const res = await fetch(`${API_BASE_URL}/variables/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    return handleResponse(res);
  },
  async deleteVariable(key) {
    const res = await fetch(`${API_BASE_URL}/variables/${key}`, { method: 'DELETE' });
    return handleResponse(res);
  },
};
export default API; 