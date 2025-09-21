const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle different error types
        if (response.status === 401) {
          // User not authenticated, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Not authenticated');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false
    );

    // Store token
    localStorage.setItem('authToken', response.access_token);

    // Get user data immediately after login
    const userData = await this.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(userData.user));

    return { user: userData.user, token: response.access_token };
  }

  async register(userData: { email: string; password: string; name?: string }) {
    const response = await this.request<any>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      false
    );

    // Register doesn't return a token, so auto-login the user
    const loginResponse = await this.login({
      email: userData.email,
      password: userData.password,
    });

    return { user: loginResponse.user, token: loginResponse.token };
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Assessment endpoints
  async createAssessment(assessmentData: {
    skills: string[];
    interests: string[];
    personality: Record<string, number>;
    experience?: string;
    goals?: string[];
  }) {
    const response = await this.request<any>('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
    return { assessment: response };
  }

  async getUserAssessments() {
    return this.request<{ assessments: any[] }>('/assessments');
  }

  async getAssessment(id: string) {
    return this.request<{ assessment: any }>(`/assessments/${id}`);
  }

  async updateAssessment(
    id: string,
    assessmentData: Partial<{
      skills: string[];
      interests: string[];
      personality: Record<string, number>;
      experience: string;
      goals: string[];
    }>
  ) {
    // FastAPI doesn't have PUT endpoint for assessments yet
    throw new Error('Assessment updates not implemented in backend');
  }

  async deleteAssessment(id: string) {
    // FastAPI doesn't have DELETE endpoint for assessments yet
    throw new Error('Assessment deletion not implemented in backend');
  }

  // Chat endpoints
  async createChatSession(assessmentId?: string) {
    const response = await this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ assessment_id: assessmentId }),
    });
    return { chat: response };
  }

  async sendChatMessage(chatId: string, content: string) {
    const aiMessage = await this.request<any>(`/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    // Create a user message object (since backend saves it automatically)
    const userMessage = {
      id: `user-${Date.now()}`,
      chat_id: chatId,
      content: content,
      sender: 'user' as 'user',
      timestamp: new Date().toISOString(),
      suggestions: []
    };

    return {
      userMessage,
      aiMessage,
      suggestions: aiMessage.suggestions || []
    };
  }

  async getChatMessages(chatId: string, limit?: number) {
    // Get the full chat with messages
    const chatResponse = await this.request<any>(`/chat/${chatId}`);
    return { messages: chatResponse.messages || [] };
  }

  async getUserChats() {
    return this.request<{ chats: any[] }>('/chat');
  }

  async deleteChat(chatId: string) {
    // FastAPI doesn't have DELETE endpoint for chats yet
    throw new Error('Chat deletion not implemented in backend');
  }

  // User endpoints
  async getUserProfile() {
    // FastAPI doesn't have user router yet
    throw new Error('User profile endpoints not implemented in backend');
  }

  async updateUserProfile(userData: { name?: string; email?: string }) {
    // FastAPI doesn't have user router yet
    throw new Error('User profile update not implemented in backend');
  }

  async getUserDashboard() {
    // FastAPI doesn't have user router yet
    throw new Error('User dashboard not implemented in backend');
  }

  async deleteUserAccount() {
    // FastAPI doesn't have user router yet
    throw new Error('User account deletion not implemented in backend');
  }

  // Logout utility (client-side only)
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Get stored user data
  getStoredUser(): any | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}

export const apiClient = new ApiClient();
