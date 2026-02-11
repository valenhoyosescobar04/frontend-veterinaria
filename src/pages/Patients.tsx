import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Filter, PawPrint, Edit, Eye, 
  Dog, Cat, Bird, Rabbit, MoreHorizontal,
  ChevronDown, ArrowUpDown, History, Phone, User,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';
import { PatientDetailsDialog } from '@/components/patients/PatientDetailsDialog';
import { patientService, Patient } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInYears, differenceInMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Iconos minimalistas por especie
const getSpeciesIcon = (species: string) => {
  const s = species.toLowerCase();
  const className = "w-4 h-4";
  if (s === 'dog' || s === 'perro') return <Dog className={className} />;
  if (s === 'cat' || s === 'gato') return <Cat className={className} />;
  if (s === 'bird' || s === 'ave') return <Bird className={className} />;
  if (s === 'rabbit' || s === 'conejo') return <Rabbit className={className} />;
  return <PawPrint className={className} />;
};

const getSpeciesStyle = (species: string) => {
    const s = species.toLowerCase();
    if (s === 'dog') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (s === 'cat') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
};

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAll();
      setPatients(response.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Error al cargar listado', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        patient.name.toLowerCase().includes(searchLower) ||
        (patient.ownerName && patient.ownerName.toLowerCase().includes(searchLower)) ||
        (patient.breed && patient.breed.toLowerCase().includes(searchLower));
      
      const matchesSpecies = speciesFilter === 'all' || 
        patient.species.toLowerCase() === speciesFilter.toLowerCase();
      
      return matchesSearch && matchesSpecies;
    });
  }, [patients, searchTerm, speciesFilter]);

  const calculateAge = (dateString?: string) => {
    if (!dateString) return <span className="text-muted-foreground">-</span>;
    const date = new Date(dateString);
    const years = differenceInYears(new Date(), date);
    if (years > 0) return `${years} años`;
    const months = differenceInMonths(new Date(), date);
    return `${months} meses`;
  };

  // Manejo de guardado
  const handleSave = async (data: any) => {
    try {
      if (selectedPatient) {
        await patientService.update(selectedPatient.id, data);
        toast({ title: 'Actualizado', description: 'Paciente actualizado correctamente' });
      } else {
        await patientService.create(data);
        toast({ title: 'Creado', description: 'Paciente registrado correctamente' });
      }
      loadPatients();
      setIsFormOpen(false);
    } catch (error) {
        toast({ title: 'Error', variant: 'destructive' });
    }
  };

  // Función auxiliar para calcular edad como string
  const calculateAgeString = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const years = differenceInYears(new Date(), date);
    if (years > 0) return `${years} años`;
    const months = differenceInMonths(new Date(), date);
    return `${months} meses`;
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    try {
      // Encabezados CSV
      const headers = [
        'Nombre',
        'Especie',
        'Raza',
        'Género',
        'Fecha de Nacimiento',
        'Edad',
        'Peso (kg)',
        'Chip',
        'Propietario',
        'Fecha de Registro'
      ];

      // Convertir datos a filas CSV
      const rows = filteredPatients.map(patient => {
        const birthDate = patient.birthDate ? format(new Date(patient.birthDate), 'dd/MM/yyyy', { locale: es }) : '';
        const age = calculateAgeString(patient.birthDate);
        const gender = patient.gender === 'MALE' ? 'Macho' : patient.gender === 'FEMALE' ? 'Hembra' : '-';
        const createdAt = patient.createdAt ? format(new Date(patient.createdAt), 'dd/MM/yyyy', { locale: es }) : '';

        return [
          patient.name || '',
          patient.species || '',
          patient.breed || '',
          gender,
          birthDate,
          age,
          patient.weight ? `${patient.weight}` : '',
          patient.microchipNumber || '',
          patient.ownerName || '',
          createdAt
        ];
      });

      // Crear contenido CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Crear BOM para UTF-8 (para Excel)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pacientes_${format(new Date(), 'yyyyMMdd_HHmmss', { locale: es })}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({ title: 'Exportación exitosa', description: `Se exportaron ${filteredPatients.length} pacientes a CSV` });
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast({ title: 'Error', description: 'No se pudo exportar el archivo CSV', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER CLEAN --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Pacientes</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Directorio clínico y gestión de expedientes.
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
                variant="outline" 
                className="hidden sm:flex"
                onClick={handleExportCSV}
                disabled={filteredPatients.length === 0}
            >
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
            <Button onClick={() => { setSelectedPatient(undefined); setIsFormOpen(true); }} className="shadow-md w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nuevo Paciente</span><span className="sm:hidden">Nuevo</span>
            </Button>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center bg-muted/40 p-3 sm:p-2 rounded-xl border">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nombre, chip o propietario..." 
                className="pl-10 bg-background border-none shadow-sm h-10 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background border-none shadow-sm">
                    <SelectValue placeholder="Especie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las especies</SelectItem>
                    <SelectItem value="dog">Perros</SelectItem>
                    <SelectItem value="cat">Gatos</SelectItem>
                    <SelectItem value="bird">Aves</SelectItem>
                    <SelectItem value="rabbit">Conejos</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* --- DATA TABLE (Desktop) --- */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Paciente</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    // Skeleton Loading Rows
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><div className="h-10 w-32 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-10 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell className="text-right"><div className="h-8 w-8 bg-muted/50 rounded animate-pulse inline-block" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredPatients.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Search className="h-10 w-10 mb-2 opacity-20" />
                                <p>No se encontraron pacientes.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    <AnimatePresence>
                        {filteredPatients.map((patient) => (
                            <motion.tr
                                key={patient.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="group hover:bg-muted/40 transition-colors border-b last:border-0"
                            >
                                {/* Col: Paciente */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getSpeciesStyle(patient.species)}`}>
                                            {getSpeciesIcon(patient.species)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{patient.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-muted-foreground/30 text-muted-foreground">
                                                    {patient.breed || 'Sin raza'}
                                                </Badge>
                                                {patient.microchipNumber && (
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        #{patient.microchipNumber.slice(-4)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Col: Propietario */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 text-sm font-medium">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            {patient.ownerName}
                                        </div>
                                        {/* Simulación de teléfono si existiera en el modelo */}
                                        {/* <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                            <Phone className="w-3 h-3" />
                                            +57 300 123 4567
                                        </div> */}
                                    </div>
                                </TableCell>

                                {/* Col: Detalles (Edad/Sexo) */}
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm">{calculateAge(patient.birthDate)}</span>
                                        <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                            {patient.gender === 'MALE' ? 'Macho' : patient.gender === 'FEMALE' ? 'Hembra' : '-'}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Col: Peso */}
                                <TableCell>
                                    {patient.weight ? (
                                        <span className="font-mono text-sm bg-muted/30 px-2 py-1 rounded">
                                            {patient.weight} kg
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                </TableCell>

                                {/* Col: Registro */}
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {patient.createdAt ? format(new Date(patient.createdAt), 'd MMM yyyy', { locale: es }) : '-'}
                                    </span>
                                </TableCell>

                                {/* Col: Acciones */}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => { setSelectedPatient(patient); setIsDetailsOpen(true); }}
                                            title="Ver Expediente"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                                            onClick={() => { setSelectedPatient(patient); setIsFormOpen(true); }}
                                            title="Editar"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                )}
            </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filteredPatients.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Search className="h-10 w-10 mx-auto mb-2 opacity-20 text-muted-foreground" />
            <p className="text-muted-foreground">No se encontraron pacientes.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${getSpeciesStyle(patient.species)}`}>
                    {getSpeciesIcon(patient.species)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{patient.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                            {patient.breed || 'Sin raza'}
                          </Badge>
                          {patient.microchipNumber && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              #{patient.microchipNumber.slice(-4)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedPatient(patient); setIsDetailsOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedPatient(patient); setIsFormOpen(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">{patient.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs">{calculateAge(patient.birthDate)}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {patient.gender === 'MALE' ? 'Macho' : patient.gender === 'FEMALE' ? 'Hembra' : '-'}
                        </span>
                        {patient.weight && (
                          <span className="text-xs font-mono bg-muted/30 px-2 py-0.5 rounded">
                            {patient.weight} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground px-2">
        <p>Mostrando {filteredPatients.length} pacientes</p>
        <p className="hidden sm:inline">Última actualización: hace unos segundos</p>
      </div>

      {/* DIALOGS */}
      <PatientFormDialog
        open={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedPatient(undefined); }}
        onSubmit={handleSave}
        patient={selectedPatient as any}
      />

      <PatientDetailsDialog
        open={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedPatient(undefined); }}
        patient={selectedPatient as any}
      />
    </div>
  );
}