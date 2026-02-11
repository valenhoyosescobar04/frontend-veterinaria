import api from './api';
import type { MedicalRecord, CreateMedicalRecordRequest, UpdateMedicalRecordRequest } from '@/types/medicalRecord';

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

export const medicalRecordService = {
  async getAll(page = 0, size = 10, search = ''): Promise<PageResponse<MedicalRecord>> {
    const params: any = { page, size, sortBy: 'recordDate', sortDirection: 'DESC' };
    if (search) params.search = search;
    
    const response = await api.get<ApiResponse<PageResponse<MedicalRecord>>>('/medical-records/page', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<MedicalRecord> {
    const response = await api.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`);
    return response.data.data;
  },

  async getByPatientId(patientId: string): Promise<MedicalRecord[]> {
    const response = await api.get<ApiResponse<MedicalRecord[]>>(`/medical-records/patient/${patientId}`);
    return response.data.data;
  },

  async getByVeterinarianId(veterinarianId: string): Promise<MedicalRecord[]> {
    const response = await api.get<ApiResponse<MedicalRecord[]>>(`/medical-records/veterinarian/${veterinarianId}`);
    return response.data.data;
  },

  async create(medicalRecord: CreateMedicalRecordRequest): Promise<MedicalRecord> {
    const response = await api.post<ApiResponse<MedicalRecord>>('/medical-records', medicalRecord);
    return response.data.data;
  },

  async update(id: number, medicalRecord: UpdateMedicalRecordRequest): Promise<MedicalRecord> {
    const response = await api.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, medicalRecord);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/medical-records/${id}`);
  },

  async search(searchTerm: string): Promise<MedicalRecord[]> {
    const response = await api.get<ApiResponse<MedicalRecord[]>>('/medical-records/search', {
      params: { q: searchTerm },
    });
    return response.data.data;
  },

  // ========== NUEVOS ENDPOINTS ==========

  async getByDateRange(startDate: string, endDate: string): Promise<MedicalRecord[]> {
    const response = await api.get<ApiResponse<MedicalRecord[]>>('/medical-records/date-range', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async getFollowUpRecords(): Promise<MedicalRecord[]> {
    const response = await api.get<ApiResponse<MedicalRecord[]>>('/medical-records/follow-up');
    return response.data.data;
  },

  async count(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/medical-records/count');
    return response.data.data;
  },
};
