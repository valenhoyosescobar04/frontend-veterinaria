import api from './api';

export interface Prescription {
  id: number;
  medicalRecordId: number;
  patientId: number;
  patientName?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  isActive?: boolean;
  isExpired?: boolean;
  isCurrentlyActive?: boolean;
  prescribedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePrescriptionRequest {
  medicalRecordId: number;
  patientId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
}

export interface UpdatePrescriptionRequest {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
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

export const prescriptionService = {
  async getAll(page = 0, size = 10): Promise<PageResponse<Prescription>> {
    const params = { page, size, sortBy: 'startDate', sortDirection: 'DESC' };
    const response = await api.get<ApiResponse<PageResponse<Prescription>>>('/prescriptions/page', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<Prescription> {
    const response = await api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
    return response.data.data;
  },

  async getByPatientId(patientId: number): Promise<Prescription[]> {
    const response = await api.get<ApiResponse<Prescription[]>>(`/prescriptions/patient/${patientId}`);
    return response.data.data;
  },

  async getActiveByPatientId(patientId: number): Promise<Prescription[]> {
    const response = await api.get<ApiResponse<Prescription[]>>(`/prescriptions/patient/${patientId}/active`);
    return response.data.data;
  },

  async getByMedicalRecordId(medicalRecordId: number): Promise<Prescription[]> {
    const response = await api.get<ApiResponse<Prescription[]>>(`/prescriptions/medical-record/${medicalRecordId}`);
    return response.data.data;
  },

  async create(prescription: CreatePrescriptionRequest): Promise<Prescription> {
    const response = await api.post<ApiResponse<Prescription>>('/prescriptions', prescription);
    return response.data.data;
  },

  async update(id: number, prescription: UpdatePrescriptionRequest): Promise<Prescription> {
    const response = await api.put<ApiResponse<Prescription>>(`/prescriptions/${id}`, prescription);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/prescriptions/${id}`);
  },

  async searchByMedication(medication: string, page = 0, size = 10): Promise<PageResponse<Prescription>> {
    const params = { medication, page, size };
    const response = await api.get<ApiResponse<PageResponse<Prescription>>>('/prescriptions/search', { params });
    return response.data.data;
  },

  async getExpiringPrescriptions(): Promise<Prescription[]> {
    const response = await api.get<ApiResponse<Prescription[]>>('/prescriptions/expiring');
    return response.data.data;
  },

  /**
   * Exportar receta en formato PDF o Excel
   */
  async exportPrescription(id: number, format: 'PDF' | 'EXCEL' = 'PDF'): Promise<Blob> {
    const response = await api.get(`/prescriptions/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

