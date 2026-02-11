import { useState, useEffect, useMemo } from 'react';
import { 
    Calendar, 
    Clock, 
    Stethoscope, 
    FileText, 
    X, 
    Plus,
    CalendarCheck,
    AlertCircle,
    CheckCircle2,
    Loader2,
    LayoutGrid,
    List as ListIcon,
    MapPin,
    ChevronRight,
    Syringe,
    Activity,
    AlertOctagon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ownerPortalService } from '@/services/ownerPortalService';
import type { Appointment } from '@/types/appointment';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, isFuture, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// --- CONFIGURACIÓN VISUAL ---

const statusConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
    SCHEDULED: { 
        label: 'Programada', 
        style: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 dark:from-blue-700 dark:to-blue-800 dark:border-blue-700',
        icon: <Calendar className="w-3 h-3" />
    },
    CONFIRMED: { 
        label: 'Confirmada', 
        style: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        icon: <CheckCircle2 className="w-3 h-3" />
    },
    IN_PROGRESS: { 
        label: 'En Consulta', 
        style: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
        icon: <Loader2 className="w-3 h-3 animate-spin" />
    },
    COMPLETED: { 
        label: 'Finalizada', 
        style: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        icon: <CheckCircle2 className="w-3 h-3" />
    },
    CANCELLED: { 
        label: 'Cancelada', 
        style: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900',
        icon: <X className="w-3 h-3" />
    },
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; border: string }> = {
    CONSULTATION: { label: 'Consulta General', icon: <Stethoscope size={18} />, color: 'text-white bg-gradient-to-br from-blue-600 to-blue-700', border: 'border-blue-600' },
    VACCINATION: { label: 'Vacunación', icon: <Syringe size={18} />, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-500' },
    SURGERY: { label: 'Cirugía', icon: <Activity size={18} />, color: 'text-rose-600 bg-rose-50', border: 'border-rose-500' },
    CHECKUP: { label: 'Chequeo', icon: <FileText size={18} />, color: 'text-violet-600 bg-violet-50', border: 'border-violet-500' },
    EMERGENCY: { label: 'Urgencia', icon: <AlertOctagon size={18} />, color: 'text-orange-600 bg-orange-50', border: 'border-orange-500' },
};

export default function OwnerMyAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await ownerPortalService.getMyAppointments();
            setAppointments(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('No se pudieron cargar las citas');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAction = async () => {
        if (!selectedAppointment) return;
        try {
            await ownerPortalService.cancelAppointment(selectedAppointment.id);
            toast.success('Cita cancelada correctamente');
            setCancelDialogOpen(false);
            setSelectedAppointment(null);
            loadAppointments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al cancelar');
        }
    };

    const filteredData = useMemo(() => {
        let filtered = appointments;
        if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter);
        return filtered.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    }, [appointments, statusFilter]);

    const stats = useMemo(() => ({
        total: appointments.length,
        upcoming: appointments.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status)).length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length
    }), [appointments]);

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Agenda Médica</h1>
                    <p className="text-muted-foreground mt-1">Gestiona tus próximas visitas y consulta el historial.</p>
                </div>
                <Link to="/owner/book-appointment">
                    <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <Plus className="mr-2 h-5 w-5" /> Nueva Cita
                    </Button>
                </Link>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Citas" value={stats.total} icon={<Calendar />} />
                <StatCard label="Próximas" value={stats.upcoming} icon={<Clock />} active />
                <StatCard label="Finalizadas" value={stats.completed} icon={<CheckCircle2 />} />
            </div>

            {/* Controls & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/30 p-2 rounded-xl border">
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                    <TabsList className="w-full sm:w-auto bg-transparent p-0 h-auto flex flex-wrap gap-1">
                        {['all', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
                            <TabsTrigger 
                                key={tab} 
                                value={tab}
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border px-4 py-2 capitalize"
                            >
                                {tab === 'all' ? 'Todas' : statusConfig[tab]?.label || tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="flex bg-background border rounded-lg p-1 gap-1">
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            {filteredData.length === 0 ? (
                <EmptyState filter={statusFilter} />
            ) : (
                <div className={cn(
                    "grid gap-4",
                    viewMode === 'grid' ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                )}>
                    {filteredData.map((apt) => (
                        <AppointmentCard 
                            key={apt.id} 
                            appointment={apt} 
                            viewMode={viewMode}
                            onCancel={() => {
                                setSelectedAppointment(apt);
                                setCancelDialogOpen(true);
                            }} 
                        />
                    ))}
                </div>
            )}

            {/* Cancel Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Cita</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de cancelar la cita para <strong>{selectedAppointment?.patientName}</strong>? 
                            Esta acción liberará el horario para otros pacientes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Mantener</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelAction} className="bg-rose-600 hover:bg-rose-700">
                            Sí, Cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// --- SUBCOMPONENTES ---

function AppointmentCard({ appointment, viewMode, onCancel }: { appointment: Appointment, viewMode: 'list' | 'grid', onCancel: () => void }) {
    const status = statusConfig[appointment.status] || statusConfig.SCHEDULED;
    const type = typeConfig[appointment.appointmentType] || typeConfig.CONSULTATION;
    const date = new Date(appointment.scheduledDate);
    const isUpcoming = isFuture(date) && !['CANCELLED', 'COMPLETED'].includes(appointment.status);
    const isUrgent = isUpcoming && differenceInHours(date, new Date()) < 24;

    const canCancel = isUpcoming && differenceInHours(date, new Date()) > 24;

    if (viewMode === 'list') {
        return (
            <div className="group flex flex-col sm:flex-row items-center gap-4 bg-card border rounded-xl p-4 transition-all hover:shadow-md hover:border-primary/20">
                {/* Date Box */}
                <div className={cn(
                    "flex flex-col items-center justify-center w-full sm:w-24 h-20 rounded-lg border-2 bg-background shrink-0",
                    type.border
                )}>
                    <span className="text-xs font-bold uppercase text-muted-foreground">{format(date, 'MMM', { locale: es })}</span>
                    <span className="text-2xl font-bold text-foreground">{format(date, 'd')}</span>
                    <span className="text-xs text-muted-foreground">{format(date, 'HH:mm')}</span>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h3 className="font-bold text-lg">{appointment.patientName}</h3>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", status.style)}>
                            {status.label}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                        {type.icon} {type.label} con <span className="font-medium text-foreground">{appointment.veterinarianName}</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {canCancel && (
                        <Button variant="ghost" size="sm" onClick={onCancel} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                            Cancelar
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        Detalles <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
            isUrgent && "ring-2 ring-amber-400 dark:ring-amber-600"
        )}>
            {/* Top Color Bar */}
            <div className={cn("absolute top-0 left-0 right-0 h-1.5", type.color.split(' ')[1].replace('bg-', 'bg-').replace('50', '500'))} />
            
            <CardContent className="pt-6 pb-4 px-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                        {/* Date Block */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-muted/50 border shadow-sm">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-0.5">
                                {format(date, 'MMM', { locale: es })}
                            </span>
                            <span className="text-xl font-bold leading-none text-foreground">
                                {format(date, 'd')}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                {appointment.patientName}
                            </h3>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                <Clock size={14} />
                                {format(date, 'HH:mm')}
                                <span className="text-xs mx-1">•</span>
                                {isToday(date) ? 'Hoy' : isTomorrow(date) ? 'Mañana' : format(date, 'EEEE', { locale: es })}
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn("capitalize shadow-none", status.style)}>
                        {status.icon} <span className="ml-1.5">{status.label}</span>
                    </Badge>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-border/50 my-4" />

                {/* Details */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Stethoscope size={16} /> Especialista
                        </span>
                        <span className="font-medium text-right">{appointment.veterinarianName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <FileText size={16} /> Tipo
                        </span>
                        <Badge variant="secondary" className={cn("font-normal", type.color)}>
                            {type.label}
                        </Badge>
                    </div>
                    {appointment.reason && (
                        <div className="bg-muted/30 p-2.5 rounded-lg text-xs text-muted-foreground italic border border-dashed">
                            "{appointment.reason}"
                        </div>
                    )}
                </div>

                {/* Footer Alert & Actions */}
                {isUrgent && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                        <AlertCircle size={14} />
                        <span className="font-semibold">Cita en menos de 24h</span>
                    </div>
                )}

                <div className="flex gap-2">
                    {canCancel ? (
                        <Button 
                            variant="outline" 
                            className="w-full text-muted-foreground hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                    ) : (
                        <Button variant="secondary" className="w-full" disabled>
                            {status.label === 'COMPLETED' ? 'Finalizada' : 'No Cancelable'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function StatCard({ label, value, icon, active }: { label: string, value: number, icon: any, active?: boolean }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
            active 
                ? "bg-primary/5 border-primary/20 shadow-sm" 
                : "bg-background border-border/60"
        )}>
            <div className={cn(
                "mb-2 p-2 rounded-full", 
                active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
                {icon}
            </div>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-muted-foreground font-medium">Cargando tu agenda...</p>
        </div>
    );
}

function EmptyState({ filter }: { filter: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-muted rounded-3xl bg-muted/5">
            <div className="bg-background p-6 rounded-full shadow-lg mb-6">
                <CalendarCheck size={48} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sin citas {filter !== 'all' && 'en esta categoría'}</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8">
                {filter === 'all' 
                    ? 'Aún no tienes citas programadas. ¡Es un buen momento para un chequeo!' 
                    : `No hay citas con el estado "${filter.toLowerCase()}" actualmente.`}
            </p>
            {filter === 'all' && (
                <Link to="/owner/book-appointment">
                    <Button>Agendar Ahora</Button>
                </Link>
            )}
        </div>
    );
}