export interface MedicalRecord {
  id: number;
  patientId: number; // Cambiado de string a number
  patientName: string;
  ownerName?: string;
  appointmentId?: number;
  veterinarianId: string;
  veterinarianName: string;
  recordDate: string;
  diagnosis: string;
  treatment: string;
  symptoms?: string;
  vitalSigns?: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordRequest {
  patientId: number; // Cambiado de string a number
  appointmentId?: number;
  veterinarianId: string;
  recordDate: string;
  diagnosis: string;
  treatment: string;
  symptoms?: string;
  vitalSigns?: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface UpdateMedicalRecordRequest {
  diagnosis?: string;
  treatment?: string;
  symptoms?: string;
  vitalSigns?: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}
