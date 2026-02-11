// Export all services from a single entry point
export { authService } from './authService';
export { ownerService } from './ownerService';
export { patientService } from './patientService';
export { appointmentService } from './appointmentService';
export { medicalRecordService } from './medicalRecordService';
export { inventoryService } from './inventoryService';
export { userService } from './userService';
export { roleService } from './roleService';
export { dashboardService } from './dashboardService';
export { agendaService } from './agendaService';
export { prescriptionService } from './prescriptionService';
export { informedConsentService } from './informedConsentService';
export { clinicService } from './clinicService';
export { reportService } from './reportService';

// Export API instance for custom calls
export { default as api } from './api';

// Export types
export type { LoginRequest, LoginResponse, RefreshTokenRequest } from './authService';
export type { Owner, ApiResponse, PageResponse } from './ownerService';
export type { Patient } from './patientService';
export type { Appointment } from './appointmentService';
export type { MedicalRecord } from './medicalRecordService';
export type { InventoryItem } from './inventoryService';
export type { CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from './userService';
export type { Role, Permission } from './roleService';
export type { DashboardStats, AppointmentStats, RevenueStats } from './dashboardService';
export type { AgendaViewType } from './agendaService';
export type { Prescription, CreatePrescriptionRequest, UpdatePrescriptionRequest } from './prescriptionService';
export type { InformedConsent, CreateInformedConsentRequest } from './informedConsentService';
export type { ClinicService, CreateServiceRequest, UpdateServiceRequest } from './clinicService';
export type { ReportType } from './reportService';
