import api from './api';

export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  color?: string;
  weight?: number;
  microchipNumber?: string;
  ownerId: string;
  ownerName?: string;
  createdAt?: string;
  updatedAt?: string;
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

export const patientService = {
  async getAll(page = 0, size = 10, search = ''): Promise<PageResponse<Patient>> {
    const params: any = { page, size };
    if (search) params.search = search;
    
    const response = await api.get<ApiResponse<PageResponse<Patient>>>('/patients', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Patient> {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data;
  },

  async getByOwnerId(ownerId: string): Promise<Patient[]> {
    const response = await api.get<ApiResponse<Patient[]>>(`/patients/owner/${ownerId}`);
    return response.data.data;
  },

  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'ownerName'>): Promise<Patient> {
    const response = await api.post<ApiResponse<Patient>>('/patients', patient);
    return response.data.data;
  },

  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    const response = await api.put<ApiResponse<Patient>>(`/patients/${id}`, patient);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async search(searchTerm: string): Promise<Patient[]> {
    const response = await api.get<ApiResponse<Patient[]>>('/patients/search', {
      params: { name: searchTerm },
    });
    return response.data.data;
  },

  // ========== NUEVOS ENDPOINTS ==========

  async getBySpecies(species: string): Promise<Patient[]> {
    const response = await api.get<ApiResponse<Patient[]>>(`/patients/species/${species}`);
    return response.data.data;
  },

  async count(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/patients/count');
    return response.data.data;
  },
};
