import api from './api';

export interface ClinicService {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  durationMinutes?: number;
  requiresAppointment?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  durationMinutes: number;
  requiresAppointment: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clinicService = {
  async getAll(): Promise<ClinicService[]> {
    const response = await api.get<ApiResponse<ClinicService[]>>('/services');
    return response.data.data;
  },

  async getAllPaginated(page = 0, size = 10): Promise<PageResponse<ClinicService>> {
    const params = { page, size, sortBy: 'name', sortDirection: 'ASC' };
    const response = await api.get<ApiResponse<PageResponse<ClinicService>>>('/services/page', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<ClinicService> {
    const response = await api.get<ApiResponse<ClinicService>>(`/services/${id}`);
    return response.data.data;
  },

  async search(query: string, page = 0, size = 10): Promise<PageResponse<ClinicService>> {
    const params = { q: query, page, size };
    const response = await api.get<ApiResponse<PageResponse<ClinicService>>>('/services/search', { params });
    return response.data.data;
  },

  async getByCategory(category: string, page = 0, size = 10): Promise<PageResponse<ClinicService>> {
    const params = { page, size };
    const response = await api.get<ApiResponse<PageResponse<ClinicService>>>(`/services/category/${category}`, { params });
    return response.data.data;
  },

  async getAllByCategory(category: string): Promise<ClinicService[]> {
    const response = await api.get<ApiResponse<ClinicService[]>>(`/services/category/${category}/all`);
    return response.data.data;
  },

  async create(service: CreateServiceRequest): Promise<ClinicService> {
    const response = await api.post<ApiResponse<ClinicService>>('/services', service);
    return response.data.data;
  },

  async update(id: number, service: UpdateServiceRequest): Promise<ClinicService> {
    const response = await api.put<ApiResponse<ClinicService>>(`/services/${id}`, service);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  async count(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/services/count');
    return response.data.data;
  },
};

