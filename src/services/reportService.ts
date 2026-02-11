import api from './api';

export type ReportType = 'APPOINTMENTS' | 'PATIENTS' | 'SERVICES';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const reportService = {
  /**
   * Generar reporte según el tipo
   */
  async generateReport(
    type: ReportType,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    const params: any = { type };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/reports/generate', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generar reporte de citas
   */
  async generateAppointmentsReport(startDate?: string, endDate?: string): Promise<Blob> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/reports/appointments', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generar reporte de pacientes
   */
  async generatePatientsReport(): Promise<Blob> {
    const response = await api.get('/reports/patients', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generar reporte de servicios
   */
  async generateServicesReport(): Promise<Blob> {
    const response = await api.get('/reports/services', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Descargar archivo desde blob
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

