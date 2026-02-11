import api from './api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    const response = await api.get<ApiResponse<Role[]>>('/roles');
    return response.data.data;
  },

  async getRoleById(id: string): Promise<Role> {
    const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },

  async createRole(role: Omit<Role, 'id' | 'permissions'> & { permissionIds: string[] }): Promise<Role> {
    const response = await api.post<ApiResponse<Role>>('/roles', role);
    return response.data.data;
  },

  async updateRole(id: string, role: Partial<Role> & { permissionIds?: string[] }): Promise<Role> {
    const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, role);
    return response.data.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  async getAllPermissions(): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>('/permissions');
    return response.data.data;
  },

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>(`/permissions/category/${category}`);
    return response.data.data;
  },
};
