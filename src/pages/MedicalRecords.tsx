import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Calendar, Activity, FileText, Thermometer, 
  Weight, AlertCircle, Stethoscope, HeartPulse, Clock, 
  ChevronRight, Filter, ClipboardList
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MedicalRecordFormDialog } from '@/components/medical-records/MedicalRecordFormDialog';
import { MedicalRecordDetailsDialog } from '@/components/medical-records/MedicalRecordDetailsDialog';
import { medicalRecordService } from '@/services/medicalRecordService';
import type { MedicalRecord } from '@/types/medicalRecord';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordService.getAll(0, 100, searchTerm);
      // Ordenar por fecha descendente (lo más reciente primero)
      const sorted = (response.content || []).sort((a, b) => 
        new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
      );
      setRecords(sorted);
    } catch (error) {
      toast.error('Error al sincronizar expedientes');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadRecords(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = `${record.patientName} ${record.veterinarianName} ${record.diagnosis}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      if (filterType === 'followup') return matchesSearch && record.followUpRequired;
      return matchesSearch;
    });
  }, [records, searchTerm, filterType]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Expedientes Clínicos <Activity className="text-primary h-6 w-6" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Historial médico cronológico y seguimiento de pacientes.
          </p>
        </div>
        <MedicalRecordFormDialog onSuccess={loadRecords}>
          <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Consulta
          </Button>
        </MedicalRecordFormDialog>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="sticky top-4 z-20 bg-background/80 backdrop-blur-xl border p-2 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en diagnósticos, pacientes o doctores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-none bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="h-8 w-px bg-border hidden sm:block my-auto" />
        <div className="flex items-center gap-2 px-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none h-9">
                    <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los registros</SelectItem>
                    <SelectItem value="followup">Requiere Seguimiento ⚠️</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* --- TIMELINE CONTENT --- */}
      <div className="relative pl-4 md:pl-8 space-y-8">
        {/* Línea vertical del timeline */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />

        {loading ? (
             // Skeleton Loading
             [1, 2, 3].map((i) => (
                <div key={i} className="relative pl-8 md:pl-12">
                    <div className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
                </div>
             ))
        ) : filteredRecords.length === 0 ? (
            <div className="relative pl-8 md:pl-12">
                <Card className="p-12 text-center border-dashed bg-muted/5">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">Sin registros clínicos</h3>
                    <p className="text-sm text-muted-foreground/70">
                        {searchTerm ? "No se encontraron resultados para tu búsqueda." : "Comienza una nueva consulta para ver el historial aquí."}
                    </p>
                </Card>
            </div>
        ) : (
            <AnimatePresence>
                {filteredRecords.map((record, index) => (
                    <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-4 md:pl-8 group"
                    >
                        {/* Timeline Dot */}
                        <div className={`
                            absolute left-0 top-6 w-8 h-8 md:w-8 md:h-8 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110
                            ${record.followUpRequired ? 'bg-orange-500 text-white' : 'bg-primary text-primary-foreground'}
                        `}>
                            {record.followUpRequired ? <AlertCircle className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                        </div>

                        {/* Card Content */}
                        <Card 
                            className={`
                                cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 overflow-hidden
                                ${record.followUpRequired ? 'border-l-orange-500' : 'border-l-primary/50'}
                            `}
                            onClick={() => { setSelectedRecord(record); setIsDetailsOpen(true); }}
                        >
                            <div className="flex flex-col md:flex-row">
                                
                                {/* Date Column */}
                                <div className="p-4 md:p-6 bg-muted/10 md:w-48 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start gap-2 border-b md:border-b-0 md:border-r">
                                    <div className="text-center md:text-left">
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                            {format(new Date(record.recordDate), "MMM", { locale: es })}
                                        </p>
                                        <p className="text-3xl font-bold text-foreground leading-none">
                                            {format(new Date(record.recordDate), "dd")}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(record.recordDate), "yyyy • HH:mm")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback className="text-[10px] bg-background">
                                                {getInitials(record.veterinarianName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-xs text-right md:text-left">
                                            <p className="font-semibold text-foreground line-clamp-1">Dr. {record.veterinarianName.split(' ')[0]}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-4 md:p-6 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-primary">{record.patientName}</h3>
                                                {record.followUpRequired && (
                                                    <Badge variant="destructive" className="text-[10px] px-1.5 h-5 bg-orange-500 hover:bg-orange-600">
                                                        Seguimiento
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-foreground/90 text-base">{record.diagnosis}</h4>
                                        </div>
                                        <ChevronRight className="text-muted-foreground/30 w-5 h-5 group-hover:text-primary transition-colors" />
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {record.treatment}
                                    </p>

                                    {/* Vital Signs Widgets */}
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {record.weight && (
                                            <VitalChip 
                                                icon={<Weight className="w-3.5 h-3.5" />} 
                                                label="Peso" 
                                                value={`${record.weight} kg`} 
                                                color="text-indigo-600 bg-indigo-50 border-indigo-100"
                                            />
                                        )}
                                        {record.temperature && (
                                            <VitalChip 
                                                icon={<Thermometer className="w-3.5 h-3.5" />} 
                                                label="Temp" 
                                                value={`${record.temperature}°C`} 
                                                color="text-rose-600 bg-rose-50 border-rose-100"
                                            />
                                        )}
                                        {record.heartRate && (
                                            <VitalChip 
                                                icon={<HeartPulse className="w-3.5 h-3.5" />} 
                                                label="Frec." 
                                                value={`${record.heartRate} bpm`} 
                                                color="text-emerald-600 bg-emerald-50 border-emerald-100"
                                            />
                                        )}
                                        {record.followUpDate && (
                                            <VitalChip 
                                                icon={<Clock className="w-3.5 h-3.5" />} 
                                                label="Próxima" 
                                                value={format(new Date(record.followUpDate), "dd MMM")} 
                                                color="text-orange-600 bg-orange-50 border-orange-100"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        )}
      </div>

      {selectedRecord && (
        <MedicalRecordDetailsDialog
          record={selectedRecord}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={() => {
            setIsDetailsOpen(false);
            setIsEditOpen(true);
          }}
          onDelete={async () => {
            try {
              await medicalRecordService.delete(selectedRecord.id);
              toast.success('Registro eliminado');
              setIsDetailsOpen(false);
              setSelectedRecord(null);
              loadRecords();
            } catch (error) {
              toast.error('Error al eliminar');
            }
          }}
        />
      )}

      {selectedRecord && (
        <MedicalRecordFormDialog
          record={selectedRecord}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={() => {
            setIsEditOpen(false);
            setSelectedRecord(null);
            loadRecords();
          }}
        />
      )}
    </div>
  );
}

// Subcomponente para los Signos Vitales
function VitalChip({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${color}`}>
            {icon}
            <span className="opacity-70">{label}:</span>
            <span className="font-bold">{value}</span>
        </div>
    );
}