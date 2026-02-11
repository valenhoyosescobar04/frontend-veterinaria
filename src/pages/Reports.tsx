import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Calendar, DollarSign, TrendingUp, Users, FileText, Download, 
  Loader2, Activity, Package, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { dashboardService, reportService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Reports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalOwners: 0,
    todayAppointments: 0,
    lowStockItems: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
  });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const dashboardStats = await dashboardService.getStats();
      setStats(dashboardStats);
    } catch (error) { console.error('Error stats', error); }
  };

  const handleGenerateReport = async (type: 'APPOINTMENTS' | 'PATIENTS' | 'SERVICES') => {
    try {
      setGeneratingReport(type);
      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'APPOINTMENTS':
          blob = await reportService.generateAppointmentsReport();
          filename = `Reporte_Citas_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'PATIENTS':
          blob = await reportService.generatePatientsReport();
          filename = `Reporte_Pacientes_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'SERVICES':
          blob = await reportService.generateServicesReport();
          filename = `Reporte_Servicios_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        default: throw new Error('Tipo inválido');
      }

      reportService.downloadBlob(blob, filename);
      toast({ title: 'Reporte descargado', className: 'bg-green-50 border-green-200' });
    } catch (error) {
      toast({ title: 'Error de generación', variant: 'destructive' });
    } finally {
      setGeneratingReport(null);
    }
  };

  // Mock Data for Charts (Simulating API)
  const revenueData = [
    { name: 'Ene', value: 4000 }, { name: 'Feb', value: 3000 }, 
    { name: 'Mar', value: 2000 }, { name: 'Abr', value: 2780 },
    { name: 'May', value: 1890 }, { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 }, { name: 'Ago', value: 4200 },
    { name: 'Sep', value: 5100 }, { name: 'Oct', value: 5800 },
    { name: 'Nov', value: 6200 }, { name: 'Dic', value: 7100 },
  ];

  const pieData = [
    { name: 'Consultas', value: 400, color: '#4F46E5' },
    { name: 'Vacunas', value: 300, color: '#10B981' },
    { name: 'Cirugías', value: 100, color: '#F43F5E' },
    { name: 'Estética', value: 200, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Analítica y Reportes <TrendingUp className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Inteligencia de negocios y exportación de datos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
            <ExportButton 
                label="Citas" 
                loading={generatingReport === 'APPOINTMENTS'} 
                onClick={() => handleGenerateReport('APPOINTMENTS')} 
            />
            <ExportButton 
                label="Pacientes" 
                loading={generatingReport === 'PATIENTS'} 
                onClick={() => handleGenerateReport('PATIENTS')} 
            />
            <ExportButton 
                label="Servicios" 
                loading={generatingReport === 'SERVICES'} 
                onClick={() => handleGenerateReport('SERVICES')} 
            />
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
            title="Ingresos Mensuales" 
            value={`$${stats.monthlyRevenue.toLocaleString()}`} 
            icon={<DollarSign className="h-4 w-4 text-emerald-600" />} 
            trend="+12.5%" 
            trendUp={true} 
        />
        <KPICard 
            title="Citas Hoy" 
            value={stats.todayAppointments} 
            icon={<Calendar className="h-4 w-4 text-blue-600" />} 
            trend="+3 vs ayer" 
            trendUp={true} 
        />
        <KPICard 
            title="Pacientes Activos" 
            value={stats.totalPatients} 
            icon={<Users className="h-4 w-4 text-violet-600" />} 
            trend="+15 este mes" 
            trendUp={true} 
        />
        <KPICard 
            title="Alertas Stock" 
            value={stats.lowStockItems} 
            icon={<Package className="h-4 w-4 text-orange-600" />} 
            trend="-2 resueltas" 
            trendUp={false} 
            isWarning={stats.lowStockItems > 0} 
        />
      </div>

      {/* --- CHARTS SECTION --- */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Visión General</TabsTrigger>
            <TabsTrigger value="financial" className="rounded-lg">Financiero</TabsTrigger>
            <TabsTrigger value="clinical" className="rounded-lg">Clínico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-7">
                
                {/* Main Revenue Chart */}
                <Card className="md:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Tendencia de Ingresos (2024)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Distribution Pie Chart */}
                <Card className="md:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Distribución de Servicios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* Placeholder contents for other tabs to show structure */}
        <TabsContent value="financial">
            <Card className="h-96 flex items-center justify-center text-muted-foreground border-dashed">
                Contenido Financiero Detallado
            </Card>
        </TabsContent>
        <TabsContent value="clinical">
            <Card className="h-96 flex items-center justify-center text-muted-foreground border-dashed">
                Estadísticas Clínicas
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function KPICard({ title, value, icon, trend, trendUp, isWarning }: any) {
    return (
        <Card className={`hover:shadow-md transition-shadow ${isWarning ? 'border-orange-200 bg-orange-50/50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${isWarning ? 'bg-orange-100' : 'bg-muted/50'}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {trendUp ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3 text-rose-500 mr-1" />
                    )}
                    <span className={trendUp ? 'text-emerald-600' : 'text-rose-600'}>
                        {trend}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function ExportButton({ label, loading, onClick }: any) {
    return (
        <Button variant="outline" size="sm" onClick={onClick} disabled={loading} className="bg-background">
            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Download className="mr-2 h-3 w-3" />}
            {label}
        </Button>
    );
}