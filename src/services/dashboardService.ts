import api from './api';

export interface DashboardStats {
  totalPatients: number;
  totalOwners: number;
  todayAppointments: number;
  lowStockItems: number;
  monthlyRevenue?: number;
  activeUsers?: number;
}

export interface AppointmentStats {
  scheduled: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface RevenueStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
  },

  async getAppointmentStats(startDate: string, endDate: string): Promise<AppointmentStats> {
    const response = await api.get<ApiResponse<AppointmentStats>>('/dashboard/appointments-stats', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async getRevenueStats(): Promise<RevenueStats> {
    const response = await api.get<ApiResponse<RevenueStats>>('/dashboard/revenue-stats');
    return response.data.data;
  },

  async getRecentActivity(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/dashboard/recent-activity');
    return response.data.data;
  },
};
