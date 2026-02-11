import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, FileText, Download, Eye, Edit, Trash2, 
  Pill, Clock, CalendarRange, User, AlertCircle, FileSpreadsheet, 
  CheckCircle2, XCircle, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PrescriptionFormDialog } from '@/components/prescriptions/PrescriptionFormDialog';
import { PrescriptionDetailsDialog } from '@/components/prescriptions/PrescriptionDetailsDialog';
import { prescriptionService, Prescription } from '@/services/prescriptionService';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | undefined>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, [page]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionService.getAll(page, 12); // Cargamos 12 para grid 3x4 o 4x3
      setPrescriptions(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      toast({ title: 'Error', description: 'Error al sincronizar recetas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        prescription.medicationName?.toLowerCase().includes(searchLower) ||
        prescription.patientName?.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'ACTIVE' && prescription.isCurrentlyActive) ||
        (statusFilter === 'EXPIRED' && prescription.isExpired) ||
        (prescription.status === statusFilter);
      
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, statusFilter]);

  // --- ACTIONS ---
  const handleExport = async (id: number, format: 'PDF' | 'EXCEL'): Promise<Blob> => {
    try {
        toast({ title: 'Generando documento...', description: 'Por favor espere...' });
        const blob = await prescriptionService.exportPrescription(id, format);
        toast({ title: 'Documento generado', className: 'bg-green-50 border-green-200' });
        return blob;
    } catch (error) {
        toast({ title: 'Error de exportación', variant: 'destructive' });
        throw error;
    }
  };

  const handleDownload = async (id: number, format: 'PDF' | 'EXCEL') => {
    try {
        const blob = await handleExport(id, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receta_${id}_${new Date().getTime()}.${format.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        // Error ya manejado en handleExport
    }
  };

  const handleDelete = async (id: number) => {
      try {
          await prescriptionService.delete(id);
          toast({ title: 'Eliminado', description: 'La prescripción ha sido eliminada.' });
          loadPrescriptions();
          setIsDetailsOpen(false);
      } catch (error) {
          toast({ title: 'Error', variant: 'destructive' });
      }
  };

  // --- UI HELPERS ---
  const getProgressInfo = (start?: string, end?: string) => {
      if (!start || !end) return { value: 0, label: 'Indefinido', color: 'bg-slate-200' };
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      const now = new Date();
      const totalDays = differenceInDays(endDate, startDate);
      const daysPassed = differenceInDays(now, startDate);
      
      let percentage = 0;
      if (totalDays > 0) {
          percentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
      } else if (isPast(endDate)) {
          percentage = 100;
      }

      let color = 'bg-emerald-500'; // Active
      let label = `${Math.max(0, differenceInDays(endDate, now))} días restantes`;

      if (percentage >= 100) {
          color = 'bg-slate-400';
          label = 'Completado';
      } else if (percentage > 80) {
          color = 'bg-orange-500';
          label = 'Finalizando pronto';
      }

      return { value: percentage, label, color };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Farmacia y Recetas <Pill className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Control de medicación y generación de documentos oficiales.
          </p>
        </div>
        <div className="flex gap-2">
            <PrescriptionFormDialog onSuccess={loadPrescriptions}>
                <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Prescripción
                </Button>
            </PrescriptionFormDialog>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="sticky top-4 z-20 bg-background/80 backdrop-blur-xl border p-2 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar medicamento o paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-none bg-transparent shadow-none h-10"
            />
        </div>
        <div className="h-8 w-px bg-border hidden sm:block my-auto" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none h-10">
                <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ACTIVE">🟢 Activas</SelectItem>
                <SelectItem value="EXPIRED">🔴 Vencidas / Completadas</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* --- GRID CONTENT --- */}
      {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-64 bg-muted/20 rounded-2xl animate-pulse border border-muted/30" />
              ))}
          </div>
      ) : filteredPrescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-muted rounded-3xl bg-muted/5 text-center">
              <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                  <Pill className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No hay recetas</h3>
              <p className="text-muted-foreground max-w-sm">
                  {searchTerm ? "No se encontraron resultados para tu búsqueda." : "Genera la primera receta digital para comenzar."}
              </p>
          </div>
      ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              <AnimatePresence>
                  {filteredPrescriptions.map((p) => {
                      const progress = getProgressInfo(p.startDate, p.endDate);
                      const isActive = p.isCurrentlyActive;

                      return (
                        <motion.div
                            key={p.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card 
                                className={`
                                    h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 cursor-pointer
                                    ${isActive ? 'border-l-emerald-500' : 'border-l-slate-300'}
                                `}
                                onClick={() => { setSelectedPrescription(p); setIsDetailsOpen(true); }}
                            >
                                {/* Header */}
                                <div className="p-5 pb-0 flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className={`
                                            h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm
                                            ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            Rx
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight line-clamp-1" title={p.medicationName}>
                                                {p.medicationName}
                                            </h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <User className="h-3 w-3" /> {p.patientName}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 -mt-1 -mr-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedPrescription(p); setIsDetailsOpen(true); }}>
                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDownload(p.id, 'PDF')}>
                                                <FileText className="mr-2 h-4 w-4" /> Descargar PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDownload(p.id, 'EXCEL')}>
                                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Descargar Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <CardContent className="p-5 pt-4 flex-1 flex flex-col">
                                    {/* Dosis Info */}
                                    <div className="grid grid-cols-2 gap-3 mb-4 bg-muted/20 p-3 rounded-lg border border-muted/30">
                                        <div>
                                            <p className="text-[10px] uppercase text-muted-foreground font-bold">Dosis</p>
                                            <p className="text-sm font-semibold truncate" title={p.dosage}>{p.dosage}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-muted-foreground font-bold">Frecuencia</p>
                                            <p className="text-sm font-semibold truncate" title={p.frequency}>{p.frequency}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        {/* Progress Bar (Timeline) */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground font-medium flex items-center gap-1">
                                                    <CalendarRange className="h-3 w-3" /> Progreso
                                                </span>
                                                <span className={`font-bold ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                    {progress.label}
                                                </span>
                                            </div>
                                            <Progress value={progress.value} className="h-2" indicatorColor={progress.color} />
                                            <div className="flex justify-between text-[10px] text-muted-foreground/70 font-mono">
                                                <span>{p.startDate ? format(new Date(p.startDate), 'dd MMM') : '-'}</span>
                                                <span>{p.endDate ? format(new Date(p.endDate), 'dd MMM') : '-'}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {p.isExpired ? (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Tratamiento Finalizado
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit animate-pulse">
                                                <Clock className="h-3.5 w-3.5" /> En curso
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                      );
                  })}
              </AnimatePresence>
          </div>
      )}

      {/* Pagination (Si aplica) */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
            <Button variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                Anterior
            </Button>
            <span className="flex items-center px-4 text-sm font-medium">
                Página {page + 1} de {totalPages}
            </span>
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                Siguiente
            </Button>
        </div>
      )}

      {/* DIALOGS */}
      <PrescriptionDetailsDialog
        open={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedPrescription(undefined); }}
        prescription={selectedPrescription}
        onEdit={(updated) => { /* lógica de update */ loadPrescriptions(); }}
        onDelete={handleDelete}
        onExport={handleExport}
      />
    </div>
  );
}