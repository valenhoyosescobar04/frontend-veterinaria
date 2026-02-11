import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, 
  Filter, MoreHorizontal, MapPin, Stethoscope 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { agendaService } from '@/services/agendaService';
import { userService } from '@/services/userService';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment } from '@/types/appointment';
import { useToast } from '@/hooks/use-toast';
import { AppointmentDetailsDialog } from '@/components/appointments/AppointmentDetailsDialog';
import { 
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameDay, addDays, addWeeks, addMonths, 
  subDays, subWeeks, subMonths, isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// Configuración de colores para citas en el calendario
const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 opacity-60',
};

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedVeterinarian, setSelectedVeterinarian] = useState<string>('all');
  const [viewType, setViewType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVeterinarians();
  }, []);

  useEffect(() => {
    loadAgenda();
  }, [selectedDate, selectedVeterinarian, viewType]);

  const loadVeterinarians = async () => {
    try {
      const response = await userService.getAll(0, 100);
      const vets = response.content.filter((user: any) => 
        user.roles?.some((role: any) => role.name === 'VETERINARIAN' || role === 'VETERINARIAN')
      );
      setVeterinarians(vets);
    } catch (error) {
      console.error('Error al cargar veterinarios');
    }
  };

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const vetId = selectedVeterinarian === 'all' ? undefined : selectedVeterinarian;
      
      let response: Appointment[];
      // Optimizamos la carga para traer un rango adecuado según la vista
      if (viewType === 'MONTHLY') {
          response = await agendaService.getMonthlyView(dateStr, vetId);
      } else if (viewType === 'WEEKLY') {
          response = await agendaService.getWeeklyView(dateStr, vetId);
      } else {
          response = await agendaService.getDailyView(dateStr, vetId);
      }
      setAppointments(response || []);
    } catch (error) {
      toast({ title: 'Error de sincronización', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewType === 'DAILY') {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
    } else if (viewType === 'WEEKLY') {
      setSelectedDate(direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleCancel = async (id: number) => {
    try {
      await appointmentService.cancel(id);
      toast({ title: 'Éxito', description: 'Cita cancelada correctamente' });
      loadAgenda();
      setIsDetailsOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cancelar la cita', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await appointmentService.delete(id);
      toast({ title: 'Éxito', description: 'Cita eliminada correctamente' });
      loadAgenda();
      setIsDetailsOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la cita', variant: 'destructive' });
    }
  };

  // --- COMPONENTES DE VISTA ---

  const DailyView = () => {
    const dayAppointments = appointments.filter(apt => 
      isSameDay(new Date(apt.scheduledDate), selectedDate)
    ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {dayAppointments.length === 0 ? (
           <EmptyState />
        ) : (
          <div className="relative border-l-2 border-muted ml-4 pl-8 py-4 space-y-8">
            {dayAppointments.map((apt) => (
                <motion.div 
                    key={apt.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                    {/* Time Dot */}
                    <div className="absolute -left-[41px] top-0 bg-background border-2 border-primary w-5 h-5 rounded-full flex items-center justify-center z-10">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    
                    <Card 
                        className="hover:shadow-md transition-all cursor-pointer border-l-4 hover:scale-[1.02]" 
                        style={{ borderLeftColor: 'var(--primary)' }}
                        onClick={() => handleAppointmentClick(apt)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {format(new Date(apt.scheduledDate), 'HH:mm')}
                                    </Badge>
                                    <Badge variant="secondary" className={statusColors[apt.status]}>
                                        {apt.status}
                                    </Badge>
                                </div>
                                {apt.veterinarianName && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                        <Stethoscope className="w-3 h-3" /> Dr. {apt.veterinarianName.split(' ')[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors">{apt.patientName}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{apt.reason || 'Consulta General'}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {apt.ownerName}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.durationMinutes} min</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const WeeklyView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {weekDays.map((day) => {
          const isCurrentDay = isToday(day);
          const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.scheduledDate), day));
          
          return (
            <div key={day.toISOString()} className={`min-h-[200px] sm:min-h-[300px] bg-background p-2 flex flex-col gap-2 ${isCurrentDay ? 'bg-blue-50/30' : ''}`}>
              <div className={`text-center p-2 rounded-lg mb-2 shrink-0 ${isCurrentDay ? 'bg-primary text-primary-foreground shadow-sm' : ''}`}>
                <div className="text-xs uppercase font-medium opacity-70">{format(day, 'EEE', { locale: es })}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
              </div>
              
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[400px] custom-scrollbar min-h-0">
                {dayAppointments.map((apt) => (
                  <AppointmentPill key={apt.id} appointment={apt} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const MonthlyView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Relleno para que empiece en lunes correctamente (si el mes empieza en miércoles, rellenar lun y mar)
    const startDayOfWeek = monthStart.getDay() || 7; // 1 (Lun) - 7 (Dom)
    const emptyDays = Array(startDayOfWeek - 1).fill(null);

    return (
      <div className="bg-background rounded-lg border shadow-sm overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-7 border-b bg-muted/20">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                  <div key={d} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-muted-foreground">{d}</div>
              ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
              {emptyDays.map((_, i) => <div key={`empty-${i}`} className="border-b border-r bg-muted/5 p-2 sm:p-4 min-h-[80px] sm:min-h-[120px]" />)}
              {days.map(day => {
                  const dayAppointments = appointments.filter(a => isSameDay(new Date(a.scheduledDate), day));
                  const isCurrentDay = isToday(day);
                  
                  return (
                      <div key={day.toISOString()} className={`border-b border-r p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] transition-colors hover:bg-muted/5 ${isCurrentDay ? 'bg-blue-50/50' : ''}`}>
                          <div className={`text-right mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${isCurrentDay ? 'text-primary' : 'text-muted-foreground'}`}>
                              <span className={isCurrentDay ? 'bg-primary text-primary-foreground w-5 h-5 sm:w-6 sm:h-6 rounded-full inline-flex items-center justify-center text-xs' : ''}>
                                  {format(day, 'd')}
                              </span>
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                              {dayAppointments.slice(0, 2).map(apt => <AppointmentPill key={apt.id} appointment={apt} small />)}
                              {dayAppointments.length > 2 && (
                                  <div className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium p-0.5 sm:p-1 hover:bg-muted rounded cursor-pointer">
                                      +{dayAppointments.length - 2} más
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
        </div>
      </div>
    );
  };

  // Subcomponente para las citas en el calendario
  const AppointmentPill = ({ appointment, small }: { appointment: Appointment, small?: boolean }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div 
                    className={`
                        text-xs rounded px-2 py-1.5 border cursor-pointer truncate transition-all hover:scale-[1.02] hover:shadow-md
                        ${statusColors[appointment.status] || 'bg-gray-100'}
                    `}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(appointment);
                    }}
                >
                    <div className="font-semibold flex justify-between">
                        <span>{format(new Date(appointment.scheduledDate), 'HH:mm')}</span>
                        {!small && <span className="opacity-75 text-[10px]">{appointment.durationMinutes}m</span>}
                    </div>
                    <div className="truncate font-medium">{appointment.patientName}</div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <div className="text-xs">
                    <p className="font-bold">{appointment.patientName}</p>
                    <p>Dueño: {appointment.ownerName}</p>
                    <p>{appointment.reason}</p>
                    <p className="text-muted-foreground">{format(new Date(appointment.scheduledDate), 'HH:mm')} - Dr. {appointment.veterinarianName}</p>
                    <p className="text-muted-foreground mt-1 text-[10px]">Click para ver detalles</p>
                </div>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );

  const EmptyState = () => (
    <div className="text-center py-12 bg-muted/10 rounded-xl border-2 border-dashed">
        <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-3" />
        <h3 className="text-lg font-semibold text-muted-foreground">Sin citas programadas</h3>
        <p className="text-sm text-muted-foreground/70">No hay actividad registrada para este día.</p>
    </div>
  );

  // --- RENDER PRINCIPAL ---

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* HEADER CONTROL BAR */}
      <div className="flex flex-col gap-4 bg-background p-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agenda Médica</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {viewType === 'DAILY' && format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              {viewType === 'WEEKLY' && `Semana ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'd MMM')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'd MMM', { locale: es })}`}
              {viewType === 'MONTHLY' && format(selectedDate, "MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* VET FILTER */}
            <Select value={selectedVeterinarian} onValueChange={setSelectedVeterinarian}>
                <SelectTrigger className="w-full sm:w-[200px] h-9">
                    <User className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Todos los doctores" />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-none">
                    <SelectItem value="all">Todos los doctores</SelectItem>
                    {veterinarians.map((vet) => (
                        <SelectItem key={vet.id} value={vet.id}>Dr. {vet.firstName} {vet.lastName}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="h-px w-full sm:h-6 sm:w-px bg-border sm:mx-2" />

            {/* NAVIGATION */}
            <div className="flex items-center border rounded-md bg-background shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="h-9 px-3 sm:px-4 font-normal flex-1 sm:flex-initial" onClick={() => setSelectedDate(new Date())}>
                    Hoy
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* VIEW TOGGLE */}
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)} className="w-full sm:w-auto">
                <TabsList className="h-9 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
                    <TabsTrigger value="DAILY" className="text-xs px-2 sm:px-3">Día</TabsTrigger>
                    <TabsTrigger value="WEEKLY" className="text-xs px-2 sm:px-3">Semana</TabsTrigger>
                    <TabsTrigger value="MONTHLY" className="text-xs px-2 sm:px-3">Mes</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </div>

      {/* CALENDAR CONTENT AREA */}
      <div className="flex-1 min-h-[500px] relative">
          {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
          )}
          
          <AnimatePresence mode="wait">
              <motion.div
                key={viewType + selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                  {viewType === 'DAILY' && <DailyView />}
                  {viewType === 'WEEKLY' && <WeeklyView />}
                  {viewType === 'MONTHLY' && <MonthlyView />}
              </motion.div>
          </AnimatePresence>
      </div>

      {/* DETAILS DIALOG */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={() => {
            setIsDetailsOpen(false);
            loadAgenda();
          }}
          onCancel={() => handleCancel(selectedAppointment.id)}
          onDelete={() => handleDelete(selectedAppointment.id)}
        />
      )}
    </div>
  );
}