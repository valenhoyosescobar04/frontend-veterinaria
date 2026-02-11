import api from './api';
import { User } from '../contexts/AuthContext';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Backend user response format
interface BackendUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Map backend user to frontend user format
const mapBackendUserToFrontend = (backendUser: BackendUser): User => {
  // Get the first role and convert to lowercase
  const backendRole = backendUser.roles?.[0] || 'RECEPTIONIST';
  
  // Map backend role to frontend role
  const roleMap: { [key: string]: 'admin' | 'veterinarian' | 'receptionist' } = {
    'ADMIN': 'admin',
    'ROLE_ADMIN': 'admin',
    'VETERINARIAN': 'veterinarian',
    'ROLE_VETERINARIAN': 'veterinarian',
    'RECEPTIONIST': 'receptionist',
    'ROLE_RECEPTIONIST': 'receptionist'
  };
  
  const role = roleMap[backendRole.toUpperCase()] || 'receptionist';
  
  return {
    id: backendUser.id,
    username: backendUser.username,
    email: backendUser.email,
    fullName: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || backendUser.username,
    role,
    roles: backendUser.roles,
  };
};

export const userService = {
  async getAll(page = 0, size = 10, search = ''): Promise<PageResponse<User>> {
    const params: any = { page, size };
    if (search) params.search = search;
    
    const response = await api.get<ApiResponse<PageResponse<BackendUser>>>('/users', { params });
    const backendPage = response.data.data;
    
    return {
      ...backendPage,
      content: backendPage.content.map(mapBackendUserToFrontend)
    };
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<BackendUser>>(`/users/${id}`);
    return mapBackendUserToFrontend(response.data.data);
  },

  async create(user: CreateUserRequest): Promise<User> {
    const response = await api.post<ApiResponse<BackendUser>>('/users', user);
    return mapBackendUserToFrontend(response.data.data);
  },

  async update(id: string, user: UpdateUserRequest): Promise<User> {
    const response = await api.put<ApiResponse<BackendUser>>(`/users/${id}`, user);
    return mapBackendUserToFrontend(response.data.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async changePassword(userId: string, request: ChangePasswordRequest): Promise<void> {
    await api.post(`/users/${userId}/change-password`, request);
  },

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await api.post(`/users/${userId}/reset-password`, { newPassword });
  },

  async toggleActive(userId: string): Promise<User> {
    const response = await api.patch<ApiResponse<BackendUser>>(`/users/${userId}/toggle-active`);
    return mapBackendUserToFrontend(response.data.data);
  },

  // ========== NUEVOS ENDPOINTS ==========

  async getByUsername(username: string): Promise<User> {
    const response = await api.get<ApiResponse<BackendUser>>(`/users/username/${username}`);
    return mapBackendUserToFrontend(response.data.data);
  },

  async unlockUser(id: string): Promise<void> {
    await api.post(`/users/${id}/unlock`);
  },

  /**
   * Obtener solo veterinarios activos
   */
  async getVeterinarians(): Promise<User[]> {
    const response = await api.get<ApiResponse<BackendUser[]>>('/users/veterinarians');
    return response.data.data.map(mapBackendUserToFrontend);
  },
};
