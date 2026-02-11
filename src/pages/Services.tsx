import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Briefcase, Edit, Trash2, 
  Stethoscope, Syringe, Scissors, Activity, Clock, 
  DollarSign, CheckCircle2, XCircle, MoreVertical, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceFormDialog } from '@/components/services/ServiceFormDialog';
import { ServiceDetailsDialog } from '@/components/services/ServiceDetailsDialog';
import { clinicService, ClinicService } from '@/services/clinicService';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Iconos y colores por categoría (Soft Pastel Theme)
const getCategoryStyle = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('consulta')) return { icon: Stethoscope, bg: 'bg-blue-100', text: 'text-blue-600' };
    if (c.includes('vacuna')) return { icon: Syringe, bg: 'bg-emerald-100', text: 'text-emerald-600' };
    if (c.includes('cirugía')) return { icon: Activity, bg: 'bg-rose-100', text: 'text-rose-600' };
    if (c.includes('estética')) return { icon: Scissors, bg: 'bg-pink-100', text: 'text-pink-600' };
    return { icon: Sparkles, bg: 'bg-violet-100', text: 'text-violet-600' };
};

export default function Services() {
  const [services, setServices] = useState<ClinicService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ClinicService | undefined>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => { loadServices(); }, [page]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await clinicService.getAllPaginated(page, 10);
      setServices(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(services.map(s => s.category)));

  const filteredServices = useMemo(() => {
      return services.filter((service) => {
        const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'active' && service.isActive) ||
          (statusFilter === 'inactive' && !service.isActive);
        return matchesSearch && matchesCategory && matchesStatus;
      });
  }, [services, searchTerm, categoryFilter, statusFilter]);

  // Actions
  const handleAddService = async (data: any) => {
    try { await clinicService.create(data); loadServices(); setIsFormOpen(false); } catch (e) {}
  };
  const handleDelete = async (id: number) => {
    try { await clinicService.delete(id); loadServices(); setIsDetailsOpen(false); } catch (e) {}
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Servicios <Briefcase className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">Configuración del catálogo clínico.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="shadow-lg hover:scale-105 transition-transform rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
        </Button>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-background/60 backdrop-blur-xl border p-2 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-2 sticky top-4 z-20">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar servicio..." 
                className="pl-10 border-none bg-transparent h-10 focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] border-none bg-transparent h-10"><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] border-none bg-transparent h-10"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* LIST CONTENT */}
      <div className="space-y-4">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-muted/20 rounded-2xl animate-pulse" />)
        ) : filteredServices.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl">No hay servicios disponibles.</div>
        ) : (
            <AnimatePresence>
                {filteredServices.map((service) => {
                    const style = getCategoryStyle(service.category);
                    const Icon = style.icon;

                    return (
                        <motion.div
                            key={service.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group"
                        >
                            <div 
                                className="bg-card hover:bg-muted/30 border rounded-2xl p-4 flex items-center gap-5 transition-all duration-300 hover:shadow-lg hover:-translate-x-1 cursor-pointer relative overflow-hidden"
                                onClick={() => { setSelectedService(service); setIsDetailsOpen(true); }}
                            >
                                {/* Left Color Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${service.isActive ? 'bg-primary' : 'bg-muted'}`} />

                                {/* Icon Avatar */}
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                                    <Icon className="h-7 w-7" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-foreground truncate">{service.name}</h3>
                                        {!service.isActive && (
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Inactivo</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate pr-4">
                                        {service.description || "Sin descripción"}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-muted-foreground">
                                        <span className="bg-muted px-2 py-0.5 rounded-md uppercase tracking-wide">{service.category}</span>
                                        {service.durationMinutes && (
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.durationMinutes} min</span>
                                        )}
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="flex items-center gap-6 pl-4 border-l border-border/50">
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-foreground tabular-nums">
                                            ${service.price?.toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedService(service); setIsDetailsOpen(true); }}>
                                                Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setSelectedService(service); setIsFormOpen(true); }}>
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(service.id)}>
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
            <span className="flex items-center px-3 text-sm">Pag {page + 1}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</Button>
        </div>
      )}

      {/* Dialogs (sin cambios en lógica) */}
      <ServiceFormDialog open={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleAddService} />
      <ServiceDetailsDialog 
        open={isDetailsOpen} 
        onClose={() => { setIsDetailsOpen(false); setSelectedService(undefined); }} 
        service={selectedService} 
        onEdit={(u) => { loadServices(); }} 
        onDelete={handleDelete} 
      />
    </div>
  );
}