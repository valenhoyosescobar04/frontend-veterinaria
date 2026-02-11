import api from './api';
import { User } from '../contexts/AuthContext';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    type: string;
    username: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('vetclinic_token');
      localStorage.removeItem('vetclinic_refresh_token');
      localStorage.removeItem('vetclinic_user');
    }
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  // Store tokens in localStorage
  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('vetclinic_token', token);
    localStorage.setItem('vetclinic_refresh_token', refreshToken);
  },

  // Get stored tokens
  getToken(): string | null {
    return localStorage.getItem('vetclinic_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('vetclinic_refresh_token');
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roles?: string[];
  }): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    await api.post('/auth/reset-password', data);
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.post('/auth/change-password', data);
  },
};
