import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Calendar as CalendarIcon, Clock, User, 
  AlertCircle, CheckCircle2, MoreHorizontal, ChevronRight, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from "@/components/ui/calendar"; // Shadcn UI Calendar
import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog';
import { AppointmentDetailsDialog } from '@/components/appointments/AppointmentDetailsDialog';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment } from '@/types/appointment';
import { toast } from 'sonner';
import { format, isSameDay, parseISO, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// Configuración de Colores y Estilos
const statusConfig: Record<string, { label: string; style: string; icon: any }> = {
  SCHEDULED: { label: 'Programada', style: 'bg-blue-100 text-blue-700 border-blue-200', icon: CalendarIcon },
  CONFIRMED: { label: 'Confirmada', style: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'En Curso', style: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  COMPLETED: { label: 'Finalizada', style: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelada', style: 'bg-rose-50 text-rose-700 border-rose-200 opacity-70', icon: X },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  CONSULTATION: { label: 'Consulta', color: 'bg-blue-500' },
  VACCINATION: { label: 'Vacuna', color: 'bg-emerald-500' },
  SURGERY: { label: 'Cirugía', color: 'bg-rose-500' },
  CHECKUP: { label: 'Control', color: 'bg-violet-500' },
  EMERGENCY: { label: 'Urgencia', color: 'bg-orange-500' },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'list'>('daily');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAll(0, 500, searchTerm); // Cargamos más para el calendario
      setAppointments(response.content || []);
    } catch (error) {
      toast.error('Error al sincronizar la agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await appointmentService.delete(id);
      toast.success('Cita eliminada');
      loadAppointments();
      setIsDetailsOpen(false);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await appointmentService.cancel(id);
      toast.success('Cita cancelada exitosamente');
      loadAppointments();
      setIsDetailsOpen(false);
    } catch (error: any) {
      console.error('Error al cancelar cita:', error);
      toast.error(error?.response?.data?.message || 'Error al cancelar la cita');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAppointment(null);
  };

  // Filtrado de citas
  const filteredAppointments = useMemo(() => {
    if (viewMode === 'list') {
      return appointments.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // En modo diario, filtramos por la fecha seleccionada
    return appointments.filter(apt => 
      selectedDate && isSameDay(parseISO(apt.scheduledDate), selectedDate)
    ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [appointments, searchTerm, selectedDate, viewMode]);

  // Fechas que tienen citas (para mostrar indicadores en el calendario)
  const daysWithAppointments = useMemo(() => {
    return appointments.map(a => new Date(a.scheduledDate));
  }, [appointments]);

  return (
    <div className="space-y-4 sm:space-y-6 h-[calc(100vh-100px)] flex flex-col">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agenda Médica</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Planificación y control de citas.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'daily' | 'list')} className="w-full sm:w-auto">
                <TabsList className="w-full sm:w-auto grid grid-cols-2">
                    <TabsTrigger value="daily" className="text-xs sm:text-sm">Vista Diaria</TabsTrigger>
                    <TabsTrigger value="list" className="text-xs sm:text-sm">Listado Global</TabsTrigger>
                </TabsList>
            </Tabs>
            <Button className="shadow-md w-full sm:w-auto" onClick={() => { setEditingAppointment(null); setIsFormOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nueva Cita</span><span className="sm:hidden">Nueva</span>
            </Button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 h-full">
        
        {/* LEFT SIDE: CALENDAR & FILTERS (Solo visible en modo diario o desktop grande) */}
        <div className={`lg:col-span-4 xl:col-span-3 space-y-4 sm:space-y-6 min-w-0 ${viewMode === 'list' ? 'hidden lg:block' : ''}`}>
            <Card className="overflow-visible border shadow-lg w-full">
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 border-b">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> Selector de Fecha
                    </h3>
                </div>
                <CardContent className="p-4 overflow-visible w-full min-w-0">
                    <div className="w-full min-w-0 overflow-visible">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md w-full"
                            locale={es}
                            modifiers={{
                                booked: daysWithAppointments,
                                today: startOfToday()
                            }}
                            modifiersClassNames={{
                                booked: "font-bold text-indigo-700 dark:text-indigo-400 relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-indigo-600 dark:after:bg-indigo-400 after:rounded-full",
                                today: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 font-semibold"
                            }}
                            classNames={{
                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                                month: "space-y-4 w-full min-w-0",
                                caption: "flex justify-center pt-1 relative items-center w-full",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex w-full",
                                head_cell: "text-muted-foreground rounded-md font-normal text-[0.8rem] flex-1 text-center",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative flex-1 aspect-square [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "w-full h-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground flex items-center justify-center",
                                day_selected: "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white hover:bg-gradient-to-br hover:from-indigo-700 hover:to-indigo-800 focus:bg-gradient-to-br focus:from-indigo-600 focus:to-indigo-700",
                                day_today: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 font-semibold",
                                day_outside: "text-muted-foreground opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats del Día Seleccionado */}
            <Card className="p-4 bg-muted/30 border-none">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Resumen del Día</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Total Citas</span>
                        <span className="font-bold">{filteredAppointments.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Confirmadas</span>
                        <span className="font-bold text-emerald-600">
                            {filteredAppointments.filter(a => a.status === 'CONFIRMED').length}
                        </span>
                    </div>
                </div>
            </Card>
        </div>

        {/* RIGHT SIDE: APPOINTMENT LIST / TIMELINE */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full">
            
            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar paciente, doctor o notas..." 
                    className="pl-10 h-10 sm:h-12 text-sm sm:text-lg bg-background border-none shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-xl" />)}
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <CalendarIcon className="w-16 h-16 mb-4" />
                        <p className="text-xl font-medium">No hay citas para este día</p>
                        <p>Selecciona otra fecha o crea una nueva cita.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredAppointments.map((apt) => {
                                const status = statusConfig[apt.status] || statusConfig.SCHEDULED;
                                const type = typeConfig[apt.appointmentType] || typeConfig.CONSULTATION;
                                const time = format(parseISO(apt.scheduledDate), 'HH:mm');
                                
                                return (
                                    <motion.div
                                        key={apt.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        layout
                                    >
                                        <Card 
                                            className="group hover:shadow-md transition-all border-l-4 cursor-pointer overflow-hidden"
                                            style={{ borderLeftColor: type.color.replace('bg-', '') }}
                                            onClick={() => { setSelectedAppointment(apt); setIsDetailsOpen(true); }}
                                        >
                                            <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                                {/* Time Column */}
                                                <div className="flex flex-row sm:flex-col items-center justify-center sm:min-w-[60px] sm:border-r sm:pr-4 gap-2 sm:gap-0 w-full sm:w-auto">
                                                    <span className="text-base sm:text-lg font-bold text-foreground">{time}</span>
                                                    <span className="text-xs text-muted-foreground">{apt.durationMinutes} min</span>
                                                </div>

                                                {/* Info Column */}
                                                <div className="flex-1 min-w-0 w-full sm:w-auto">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-2">
                                                        <h3 className="font-bold text-base sm:text-lg truncate flex flex-wrap items-center gap-2">
                                                            {apt.patientName}
                                                            <Badge variant="outline" className="text-[10px] font-normal h-5">
                                                                {type.label}
                                                            </Badge>
                                                        </h3>
                                                        <Badge variant="secondary" className={`${status.style} border-0 w-fit`}>
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" /> <span className="truncate">{apt.ownerName}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> <span className="truncate">Dr. {apt.veterinarianName}</span>
                                                        </span>
                                                    </div>
                                                    
                                                    {apt.reason && (
                                                        <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2 sm:truncate">
                                                            "{apt.reason}"
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Action Arrow */}
                                                <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                                                    <Button variant="ghost" size="icon">
                                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* DETAILS DIALOG */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={() => handleEdit(selectedAppointment)}
          onCancel={() => handleCancel(selectedAppointment.id)}
          onDelete={() => handleDelete(selectedAppointment.id)}
        />
      )}

      {/* FORM DIALOG (Crear/Editar) */}
      <AppointmentFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) handleFormClose();
        }}
        onSuccess={loadAppointments}
        appointment={editingAppointment}
      />
    </div>
  );
}