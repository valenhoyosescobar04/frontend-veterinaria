import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, FileText, Eye, Edit, Trash2, 
  CheckCircle2, PenTool, ShieldCheck, AlertTriangle, 
  Clock, Calendar, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InformedConsentFormDialog } from '@/components/informed-consents/InformedConsentFormDialog';
import { InformedConsentDetailsDialog } from '@/components/informed-consents/InformedConsentDetailsDialog';
import { informedConsentService, InformedConsent } from '@/services/informedConsentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// Configuración de traducción de tipos de procedimientos
const procedureTypeLabels: Record<string, string> = {
  SURGERY: 'Cirugía',
  ANESTHESIA: 'Anestesia',
  VACCINATION: 'Vacunación',
  DIAGNOSTIC: 'Diagnóstico',
  TREATMENT: 'Tratamiento',
  OTHER: 'Otro',
};

const getProcedureTypeLabel = (type: string | undefined): string => {
  if (!type) return 'Sin especificar';
  return procedureTypeLabels[type] || type;
};

export default function InformedConsents() {
  const [consents, setConsents] = useState<InformedConsent[]>([]);
  const [pendingConsents, setPendingConsents] = useState<InformedConsent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<InformedConsent | undefined>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [page, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes] = await Promise.all([
          informedConsentService.getAll(page, 10),
          informedConsentService.getPendingConsents()
      ]);
      setConsents(allRes.content || []);
      setPendingConsents(pendingRes || []);
    } catch (error) {
      toast({ title: 'Error de sincronización', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const displayedConsents = useMemo(() => {
      const source = activeTab === 'all' ? consents : pendingConsents;
      return source.filter((c) => 
        c.procedureType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [consents, pendingConsents, activeTab, searchTerm]);

  // --- ACTIONS ---
  const handleSign = async (id: number) => {
      try {
          const signature = `Firmado digitalmente - ${new Date().toLocaleString('es-ES')}`;
          await informedConsentService.signConsent(id, signature);
          toast({ title: 'Documento Firmado', description: 'El consentimiento ha sido legalizado correctamente.' });
          loadData();
          setIsDetailsOpen(false);
      } catch (error) {
          toast({ title: 'Error al firmar', variant: 'destructive' });
      }
  };

  const handleDelete = async (id: number) => {
      try {
          await informedConsentService.delete(id);
          toast({ title: 'Eliminado', description: 'Documento eliminado del sistema.' });
          loadData();
          setIsDetailsOpen(false);
      } catch (error) {
          toast({ title: 'Error', variant: 'destructive' });
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Gestión Legal <ShieldCheck className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Repositorio de consentimientos informados y autorizaciones.
          </p>
        </div>
        <div className="flex gap-2">
            <Button 
                onClick={() => setIsFormOpen(true)} 
                className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
                <Plus className="mr-2 h-4 w-4" /> Nuevo Documento
            </Button>
        </div>
      </div>

      {/* --- TABS & FILTERS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/40 p-2 rounded-xl border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
                <TabsTrigger value="all" className="w-24">Todos</TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                    Pendientes
                    {pendingConsents.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white animate-pulse">
                            {pendingConsents.length}
                        </span>
                    )}
                </TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar documento..." 
                className="pl-10 h-10 border-none bg-background shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* --- DOCUMENTS GRID --- */}
      {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-xl" />)}
          </div>
      ) : displayedConsents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted rounded-3xl bg-muted/5">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No hay documentos en esta vista</p>
          </div>
      ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              <AnimatePresence>
                  {displayedConsents.map((consent) => (
                      <motion.div
                          key={consent.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                      >
                          <Card 
                              className={`
                                  group cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 overflow-hidden
                                  ${consent.isSigned ? 'border-l-emerald-500' : 'border-l-orange-400'}
                              `}
                              onClick={() => { setSelectedConsent(consent); setIsDetailsOpen(true); }}
                          >
                              <CardContent className="p-5">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className={`p-2.5 rounded-lg ${consent.isSigned ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                          <FileText className="h-6 w-6" />
                                      </div>
                                      {consent.isSigned ? (
                                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                              <CheckCircle2 className="w-3 h-3 mr-1" /> Firmado
                                          </Badge>
                                      ) : (
                                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 animate-pulse">
                                              <PenTool className="w-3 h-3 mr-1" /> Pendiente
                                          </Badge>
                                      )}
                                  </div>

                                  <h3 className="font-bold text-lg leading-tight mb-1 truncate" title={getProcedureTypeLabel(consent.procedureType)}>
                                      {getProcedureTypeLabel(consent.procedureType)}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                                      {consent.procedureDescription || consent.description || "Sin descripción"}
                                  </p>

                                  <div className="space-y-2 pt-3 border-t text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                          <UserCheck className="w-3.5 h-3.5" />
                                          <span className="font-medium text-foreground">{consent.patientName}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          {consent.isSigned ? (
                                              <>
                                                  <Calendar className="w-3.5 h-3.5" />
                                                  <span>{format(new Date(consent.signedDate!), 'dd MMM yyyy', { locale: es })}</span>
                                              </>
                                          ) : (
                                              <>
                                                  <Clock className="w-3.5 h-3.5" />
                                                  <span>Esperando firma...</span>
                                              </>
                                          )}
                                      </div>
                                  </div>

                                  {/* Hover Action */}
                                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                      <span className="bg-background px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border flex items-center gap-1">
                                          <Eye className="w-3 h-3" /> Ver Documento
                                      </span>
                                  </div>
                              </CardContent>
                          </Card>
                      </motion.div>
                  ))}
              </AnimatePresence>
          </div>
      )}

      {/* DIALOGS */}
      <InformedConsentFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
            await informedConsentService.create(data);
            loadData();
            setIsFormOpen(false);
        }}
      />

      <InformedConsentDetailsDialog
        open={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedConsent(undefined); }}
        consent={selectedConsent}
        onSign={handleSign}
        onDelete={handleDelete}
      />
    </div>
  );
}