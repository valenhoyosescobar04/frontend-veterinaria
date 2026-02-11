import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Users, PawPrint, AlertCircle, TrendingUp, 
  Clock, DollarSign, Activity, ArrowUpRight, Plus, 
  Search, Bell, MoreHorizontal, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, appointmentService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Configuración de Estilos de Estado (Modernizados)
const statusConfig: Record<string, { label: string; style: string; icon: any }> = {
  SCHEDULED: { label: 'Programada', style: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300', icon: Calendar },
  CONFIRMED: { label: 'Confirmada', style: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'En Curso', style: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
  COMPLETED: { label: 'Finalizada', style: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelada', style: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300', icon: AlertCircle },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalOwners: 0,
    todayAppointments: 0,
    lowStockItems: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');

  // Lógica de Saludo
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  // Lógica de Carga de Datos (Mantenida intacta pero optimizada)
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    
    const handleEvents = () => loadDashboardData();
    window.addEventListener('focus', handleEvents);
    window.addEventListener('appointment_created', handleEvents);
    window.addEventListener('appointment_updated', handleEvents);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleEvents);
      window.removeEventListener('appointment_created', handleEvents);
      window.removeEventListener('appointment_updated', handleEvents);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Optimizamos para que la UI no parpadee si ya hay datos
      if(!stats.totalPatients) setLoading(true);
      
      const dashboardStats = await dashboardService.getStats();
      setStats({
        totalPatients: Number(dashboardStats.totalPatients) || 0,
        totalOwners: Number(dashboardStats.totalOwners) || 0,
        todayAppointments: Number(dashboardStats.todayAppointments) || 0,
        lowStockItems: Number(dashboardStats.lowStockItems) || 0,
        monthlyRevenue: Number(dashboardStats.monthlyRevenue) || 0,
        activeUsers: Number(dashboardStats.activeUsers) || 0,
      });

      const today = new Date().toISOString().split('T')[0];
      const appointments = await appointmentService.getByDate(today);
      setRecentAppointments(appointments.slice(0, 5));
    } catch (error: any) {
      console.error('Dashboard sync error', error);
      if (!recentAppointments.length) { // Solo mostrar error si no hay datos previos
          toast({ title: 'Error de sincronización', description: 'Reintentando conexión...', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Animaciones Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 p-1 pb-10">
      
      {/* --- HEADER CONTEXTUAL --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {greeting}, {user?.fullName?.split(' ')[0]} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema operativo y sincronizado
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
                <Bell className="w-4 h-4 mr-2" /> Notificaciones
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> Nueva Consulta
            </Button>
        </div>
      </div>

      {loading && stats.totalPatients === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
          {/* --- KPI CARDS (BENTO STYLE) --- */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                title="Citas Hoy"
                value={stats.todayAppointments}
                icon={<Calendar className="h-4 w-4 text-blue-600" />}
                trend="+12% vs ayer"
                color="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
            />
            <StatCard 
                title="Pacientes Activos"
                value={stats.totalPatients}
                icon={<PawPrint className="h-4 w-4 text-violet-600" />}
                trend="Total registrados"
                color="bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800"
            />
            <StatCard 
                title="Ingresos Mes"
                value={stats.monthlyRevenue}
                prefix="$"
                icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                trend="+8.2% proyección"
                color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
            />
            <StatCard 
                title="Alertas Stock"
                value={stats.lowStockItems}
                icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
                trend="Requiere atención"
                isAlert={stats.lowStockItems > 0}
                color="bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800"
            />
          </div>

          {/* --- MAIN DASHBOARD GRID --- */}
          <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
            
            {/* LEFT: TIMELINE DE CITAS (4 columnas) */}
            <motion.div variants={itemVariants} className="md:col-span-4 rounded-3xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-6 flex flex-row items-center justify-between border-b bg-muted/20">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" /> 
                            Agenda del Día
                        </CardTitle>
                        <CardDescription>
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-background">
                        {recentAppointments.length} Citas
                    </Badge>
                </div>
                
                <div className="p-6">
                    {recentAppointments.length === 0 ? (
                        <EmptyState 
                            icon={<Calendar className="w-10 h-10 text-muted-foreground/50" />}
                            title="Agenda Libre"
                            desc="No hay citas programadas para el resto del día."
                        />
                    ) : (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                            {recentAppointments.map((apt, index) => {
                                const status = statusConfig[apt.status] || statusConfig.SCHEDULED;
                                return (
                                    <div key={apt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        
                                        {/* Dot on Timeline */}
                                        <div className="absolute left-0 md:left-1/2 w-10 h-10 -ml-5 md:-ml-5 flex items-center justify-center rounded-full bg-card border-4 border-background shadow-sm z-10 group-hover:scale-110 transition-transform">
                                            <status.icon className={`w-4 h-4 ${status.style.split(' ')[1]}`} />
                                        </div>

                                        {/* Content Card */}
                                        <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: 'currentColor' }}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-mono text-sm font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                                                    {format(new Date(apt.scheduledDate), 'HH:mm', { locale: es })}
                                                </span>
                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border-0 ${status.style}`}>
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-foreground truncate">{apt.patientName || 'Sin nombre'}</h4>
                                            <p className="text-xs text-muted-foreground mb-3 truncate">{apt.ownerName || 'Sin propietario'}</p>
                                            {apt.reason && (
                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{apt.reason}</p>
                                            )}
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-primary h-full rounded-full w-full opacity-50"></div>
                                                </div>
                                                <span className="text-[10px] whitespace-nowrap">{apt.durationMinutes || 30} min</span>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* RIGHT: ANALYTICS & QUICK ACTIONS (3 columnas) */}
            <div className="md:col-span-3 space-y-4">
                
                {/* Analytics Chart Simulation */}
                <motion.div variants={itemVariants}>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="w-5 h-5 text-muted-foreground" />
                                Rendimiento Mensual
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5">
                                <ChartBar label="Consultas" count={124} max={150} color="bg-blue-500" />
                                <ChartBar label="Vacunaciones" count={89} max={150} color="bg-violet-500" />
                                <ChartBar label="Cirugías" count={32} max={150} color="bg-rose-500" />
                                <ChartBar label="Emergencias" count={18} max={150} color="bg-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Team / Users */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Equipo Activo</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    {stats.activeUsers > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                            +{stats.activeUsers - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}

// --- SUBCOMPONENTES ESTILIZADOS ---

function StatCard({ title, value, prefix = "", icon, trend, color, isAlert }: any) {
    return (
        <Card className={`overflow-hidden transition-all hover:shadow-lg border-l-4 ${color.replace('bg-', 'border-l-').split(' ')[0]}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${color}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${isAlert ? 'text-rose-600 animate-pulse' : ''}`}>
                    {prefix}{value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {isAlert ? <AlertCircle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {trend}
                </p>
            </CardContent>
        </Card>
    );
}

function ChartBar({ label, count, max, color }: { label: string, count: number, max: number, color: string }) {
    const percentage = Math.round((count / max) * 100);
    return (
        <div className="space-y-1 group">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{label}</span>
                <span className="font-bold">{count}</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`} 
                />
            </div>
        </div>
    );
}

function EmptyState({ icon, title, desc }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
            <div className="bg-background p-3 rounded-full mb-3 shadow-sm">{icon}</div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">{desc}</p>
        </div>
    );
}