export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientSpecies?: string;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string;
  veterinarianId: string;
  veterinarianName: string;
  scheduledDate: string;
  appointmentType: 'CONSULTATION' | 'VACCINATION' | 'SURGERY' | 'CHECKUP' | 'EMERGENCY';
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  notes?: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: number;
  ownerId: number;
  veterinarianId: string;
  scheduledDate: string;
  appointmentType: 'CONSULTATION' | 'VACCINATION' | 'SURGERY' | 'CHECKUP' | 'EMERGENCY';
  reason: string;
  notes?: string;
  durationMinutes?: number;
}

export interface UpdateAppointmentRequest {
  scheduledDate?: string;
  appointmentType?: 'CONSULTATION' | 'VACCINATION' | 'SURGERY' | 'CHECKUP' | 'EMERGENCY';
  status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  notes?: string;
  durationMinutes?: number;
}
