const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const authToken = token || localStorage.getItem('lawsa_token');
    return {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    };
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    return response.json();
  }

  // Workflow endpoints
  async saveWorkflow(workflowData: any, token?: string) {
    const response = await fetch(`${API_BASE_URL}/api/workflows`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(workflowData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save workflow');
    }

    return response.json();
  }

  async getWorkflows(token?: string) {
    const response = await fetch(`${API_BASE_URL}/api/workflows`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch workflows');
    }

    return response.json();
  }

  async getWorkflow(id: string, token?: string) {
    const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch workflow');
    }

    return response.json();
  }

  async updateWorkflow(id: string, workflowData: any, token?: string) {
    const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(workflowData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update workflow');
    }

    return response.json();
  }

  async deleteWorkflow(id: string, token?: string) {
    const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete workflow');
    }

    return response.json();
  }

  // Credentials endpoints
  async getCredentials(token?: string) {
    const response = await fetch(`${API_BASE_URL}/credentials`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch credentials');
    }

    return response.json();
  }

  async saveCredential(credentialData: any, token?: string) {
    const response = await fetch(`${API_BASE_URL}/credentials`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(credentialData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save credential');
    }

    return response.json();
  }

  // Execution endpoints
  async executeWorkflow(workflowId: string, inputData?: any, token?: string) {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(inputData || {}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to execute workflow');
    }

    return response.json();
  }

  async executeRealWorkflow(workflow: any, input: string, threadId: string, token?: string) {
    const response = await fetch(`${API_BASE_URL}/execute-real`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({
        graph: workflow,
        input: input,
        thread_id: threadId
      }),
    });

    if (!response.ok) {
      // Try to get error message from response
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Failed to execute workflow';
      
      try {
        if (contentType && contentType.includes('text/plain')) {
          // Plain text error response
          errorMessage = await response.text();
        } else {
          // JSON error response
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the default message
        console.error('Error parsing error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Check if the response is text/plain (clean format) or application/json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/plain')) {
      // Clean format - return as string
      return await response.text();
    } else {
      // JSON format - return as JSON
      return await response.json();
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
