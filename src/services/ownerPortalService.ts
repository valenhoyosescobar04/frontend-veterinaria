import api from './api';
import type { CreateAppointmentRequest } from '@/types/appointment';

class OwnerPortalService {
    /**
     * Obtener el owner por UUID del usuario
     * IMPORTANTE: userId debe ser un UUID, no un username
     */
    async getOwnerByUserId(userId: string): Promise<any> {
        const response = await api.get(`/owners/user/${userId}`);
        return response.data.data;
    }

    async getMyAppointments(): Promise<any[]> {
        const response = await api.get('/owner-portal/my-appointments');
        return response.data.data;
    }

    async getMyPets(): Promise<any[]> {
        const response = await api.get('/owner-portal/my-pets');
        return response.data.data;
    }

    async getAvailableServices(): Promise<any[]> {
        const response = await api.get('/owner-portal/services');
        return response.data.data;
    }

    async createAppointment(data: CreateAppointmentRequest): Promise<any> {
        const response = await api.post('/owner-portal/appointments', data);
        return response.data.data;
    }

    async cancelAppointment(appointmentId: number): Promise<any> {
        const response = await api.put(`/owner-portal/appointments/${appointmentId}/cancel`);
        return response.data.data;
    }

    async rescheduleAppointment(appointmentId: number, data: CreateAppointmentRequest): Promise<any> {
        const response = await api.put(`/owner-portal/appointments/${appointmentId}/reschedule`, data);
        return response.data.data;
    }
}

export const ownerPortalService = new OwnerPortalService();