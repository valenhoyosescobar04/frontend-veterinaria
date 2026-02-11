import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Calendar, Clock, User, FileText, PawPrint, Edit,
    Trash2, XCircle, Phone, Mail, MapPin, AlertTriangle,
    Stethoscope, Syringe, Activity, FileCheck
} from 'lucide-react';
import type { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppointmentDetailsDialogProps {
    appointment: Appointment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onCancel?: () => void;
}

// Configuración visual por tipo de cita
const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    CONSULTATION: { label: 'Consulta General', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
    VACCINATION: { label: 'Vacunación', icon: Syringe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    SURGERY: { label: 'Cirugía', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
    CHECKUP: { label: 'Control', icon: FileCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
    EMERGENCY: { label: 'Urgencia', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
};

const statusConfig: Record<string, { label: string; style: string }> = {
    SCHEDULED: { label: 'Programada', style: 'bg-blue-100 text-blue-700' },
    CONFIRMED: { label: 'Confirmada', style: 'bg-emerald-100 text-emerald-700' },
    IN_PROGRESS: { label: 'En Curso', style: 'bg-amber-100 text-amber-700' },
    COMPLETED: { label: 'Finalizada', style: 'bg-slate-100 text-slate-700' },
    CANCELLED: { label: 'Cancelada', style: 'bg-rose-50 text-rose-700' },
};

export function AppointmentDetailsDialog({
    appointment,
    open,
    onOpenChange,
    onEdit,
    onDelete,
    onCancel,
}: AppointmentDetailsDialogProps) {

    const config = typeConfig[appointment.appointmentType] || typeConfig.CONSULTATION;
    const status = statusConfig[appointment.status] || statusConfig.SCHEDULED;
    const TypeIcon = config.icon;

    const formatDate = (dateString: string) => format(new Date(dateString), "EEEE, d 'de' MMMM", { locale: es });
    const formatTime = (dateString: string) => format(new Date(dateString), "HH:mm");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">

                {/* --- HEADER BANNER --- */}
                <div className={`px-6 py-6 ${config.bg} border-b flex justify-between items-start`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white shadow-sm ${config.color}`}>
                            <TypeIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Badge variant="secondary" className="bg-white/60 backdrop-blur-sm border-0 font-normal">
                                    #{appointment.id}
                                </Badge>
                                <Badge className={`${status.style} border-0 shadow-none`}>
                                    {status.label}
                                </Badge>
                            </div>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                {config.label}
                            </DialogTitle>
                        </div>
                    </div>

                    <div className="text-right hidden sm:block">
                        <div className="text-3xl font-bold text-gray-900">{formatTime(appointment.scheduledDate)}</div>
                        <div className="text-gray-600 font-medium capitalize">{formatDate(appointment.scheduledDate)}</div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row">

                    {/* --- SIDEBAR (DATOS TÉCNICOS) --- */}
                    <div className="w-full md:w-1/3 bg-muted/30 border-r p-6 space-y-6">

                        {/* Paciente */}
                        <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Paciente</h4>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                        {appointment.patientName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-base">{appointment.patientName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{appointment.patientSpecies || 'Mascota'}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Cliente */}
                        <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Propietario</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{appointment.ownerName}</span>
                                </div>
                                {appointment.ownerPhone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        <span>{appointment.ownerPhone}</span>
                                    </div>
                                )}
                                {/* Fake email if not present */}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">contacto@cliente.com</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Doctor */}
                        <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Especialista</h4>
                            <div className="flex items-center gap-2 bg-background p-2 rounded-lg border shadow-sm">
                                <div className="bg-blue-100 p-1.5 rounded-md">
                                    <Stethoscope className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold text-foreground">
                                        {appointment.veterinarianName ? `Dr. ${appointment.veterinarianName}` : 'No asignado'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Veterinario</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- MAIN CONTENT (HISTORIA CLÍNICA) --- */}
                    <div className="flex-1 p-6 space-y-6">

                        {/* Info Rápida Móvil */}
                        <div className="sm:hidden mb-4 p-4 bg-muted/50 rounded-lg">
                            <div className="font-bold text-lg text-center">{formatDate(appointment.scheduledDate)}</div>
                            <div className="text-center text-muted-foreground">{formatTime(appointment.scheduledDate)} ({appointment.durationMinutes} min)</div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3 text-primary">
                                <FileText className="w-5 h-5" />
                                Motivo de Consulta
                            </h4>
                            <div className="bg-background border rounded-xl p-4 text-sm leading-relaxed shadow-sm">
                                {appointment.reason}
                            </div>
                        </div>

                        {appointment.notes && (
                            <div>
                                <h4 className="flex items-center gap-2 font-semibold text-lg mb-3 text-muted-foreground">
                                    <PawPrint className="w-5 h-5" />
                                    Notas Clínicas
                                </h4>
                                <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 text-sm leading-relaxed text-yellow-900">
                                    {appointment.notes}
                                </div>
                            </div>
                        )}

                        {/* Metadata Footer */}
                        <div className="mt-auto pt-6 flex flex-col sm:flex-row justify-between text-xs text-muted-foreground border-t gap-2">
                            <p>Creado: {format(new Date(appointment.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                            <p>Última mod: {format(new Date(appointment.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
                        </div>

                    </div>
                </div>

                {/* --- FOOTER ACTIONS --- */}
                {(onEdit || onDelete || onCancel) && (
                    <div className="p-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-3">
                        {onCancel && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                            <Button onClick={onCancel} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                                <XCircle className="h-4 w-4 mr-2" /> Cancelar Cita
                            </Button>
                        )}
                        {onEdit && (
                            <Button onClick={onEdit} variant="outline" className="border-gray-300">
                                <Edit className="h-4 w-4 mr-2" /> Modificar
                            </Button>
                        )}
                        {onDelete && (
                            <Button onClick={onDelete} variant="destructive" className="sm:ml-auto">
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </Button>
                        )}
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}