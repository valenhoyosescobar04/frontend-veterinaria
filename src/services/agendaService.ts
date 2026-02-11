import api from './api';
import type { Appointment } from '@/types/appointment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type AgendaViewType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export const agendaService = {
  /**
   * Obtener vista de agenda según el tipo
   */
  async getAgendaView(
    type: AgendaViewType = 'DAILY',
    date: string,
    veterinarianId?: string
  ): Promise<Appointment[]> {
    const params: any = { type, date };
    if (veterinarianId) params.veterinarianId = veterinarianId;

    const response = await api.get<ApiResponse<Appointment[]>>('/agenda/view', { params });
    return response.data.data;
  },

  /**
   * Obtener vista diaria
   */
  async getDailyView(date: string, veterinarianId?: string): Promise<Appointment[]> {
    const params: any = { date };
    if (veterinarianId) params.veterinarianId = veterinarianId;

    const response = await api.get<ApiResponse<Appointment[]>>('/agenda/daily', { params });
    return response.data.data;
  },

  /**
   * Obtener vista semanal
   */
  async getWeeklyView(date: string, veterinarianId?: string): Promise<Appointment[]> {
    const params: any = { date };
    if (veterinarianId) params.veterinarianId = veterinarianId;

    const response = await api.get<ApiResponse<Appointment[]>>('/agenda/weekly', { params });
    return response.data.data;
  },

  /**
   * Obtener vista mensual
   */
  async getMonthlyView(date: string, veterinarianId?: string): Promise<Appointment[]> {
    const params: any = { date };
    if (veterinarianId) params.veterinarianId = veterinarianId;

    const response = await api.get<ApiResponse<Appointment[]>>('/agenda/monthly', { params });
    return response.data.data;
  },
};

