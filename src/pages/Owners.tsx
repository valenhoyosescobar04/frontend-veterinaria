import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Mail, Phone, MapPin, MoreHorizontal, 
  User, FileText, ArrowUpDown, Filter, Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OwnerFormDialog } from '@/components/owners/OwnerFormDialog';
import { OwnerDetailsDialog } from '@/components/owners/OwnerDetailsDialog';
import { ownerService } from '@/services/ownerService';
import type { Owner } from '@/types/owner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Owners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const response = await ownerService.getAll(0, 100, searchTerm);
      setOwners(response.content || []);
    } catch (error) {
      toast.error('Error al cargar la base de datos de clientes');
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => loadOwners(), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-700',
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-yellow-100 text-yellow-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Directorio de Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestiona la base de datos de propietarios y contactos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" className="hidden sm:flex" onClick={() => loadOwners()}>
                <ArrowUpDown className="mr-2 h-4 w-4" /> Actualizar
            </Button>
            <OwnerFormDialog onSuccess={loadOwners}>
                <Button className="shadow-md w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nuevo Cliente</span><span className="sm:hidden">Nuevo</span>
                </Button>
            </OwnerFormDialog>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex items-center gap-3 sm:gap-4 bg-muted/40 p-3 sm:p-2 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, cédula o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-none shadow-sm h-10 text-sm sm:text-base"
          />
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
            <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* --- DATA TABLE (Desktop) --- */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Cliente</TableHead>
                    <TableHead>Identificación</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    // Skeleton Rows
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><div className="flex gap-3"><div className="h-10 w-10 rounded-full bg-muted animate-pulse" /><div className="space-y-2"><div className="h-4 w-32 bg-muted animate-pulse rounded" /><div className="h-3 w-20 bg-muted animate-pulse rounded" /></div></div></TableCell>
                            <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                            <TableCell><div className="space-y-2"><div className="h-4 w-32 bg-muted animate-pulse rounded" /><div className="h-3 w-24 bg-muted animate-pulse rounded" /></div></TableCell>
                            <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                            <TableCell className="text-right"><div className="h-8 w-8 bg-muted animate-pulse rounded inline-block" /></TableCell>
                        </TableRow>
                    ))
                ) : owners.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Search className="h-10 w-10 mb-2 opacity-20" />
                                <p>No se encontraron clientes con esos criterios.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    <AnimatePresence>
                        {owners.map((owner) => (
                            <motion.tr
                                key={owner.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="group hover:bg-muted/40 transition-colors border-b last:border-0 cursor-pointer"
                                onClick={() => { setSelectedOwner(owner); setIsDetailsOpen(true); }}
                            >
                                {/* Col: Cliente (Avatar + Nombre) */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-muted">
                                            <AvatarFallback className={`${getRandomColor(owner.firstName)} font-bold text-xs`}>
                                                {getInitials(owner.firstName, owner.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-foreground">{owner.firstName} {owner.lastName}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <User className="h-3 w-3" /> Cliente #{owner.id}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Col: Identificación */}
                                <TableCell>
                                    <Badge variant="outline" className="font-mono font-normal text-muted-foreground">
                                        {owner.documentType} {owner.documentNumber}
                                    </Badge>
                                </TableCell>

                                {/* Col: Contacto */}
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                            <a href={`mailto:${owner.email}`} className="hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                                {owner.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span>{owner.phone}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Col: Ubicación */}
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{owner.city}, {owner.address}</span>
                                    </div>
                                </TableCell>

                                {/* Col: Acciones */}
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedOwner(owner); setIsDetailsOpen(true); }}>
                                                Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                // Aquí iría la lógica de edición directa si existiera un botón separado
                                                setSelectedOwner(owner); 
                                                setIsDetailsOpen(true);
                                            }}>
                                                Editar Información
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
        ) : owners.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Search className="h-10 w-10 mx-auto mb-2 opacity-20 text-muted-foreground" />
            <p className="text-muted-foreground">No se encontraron clientes con esos criterios.</p>
          </div>
        ) : (
          <AnimatePresence>
            {owners.map((owner) => (
              <motion.div
                key={owner.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => { setSelectedOwner(owner); setIsDetailsOpen(true); }}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border border-muted flex-shrink-0">
                    <AvatarFallback className={`${getRandomColor(owner.firstName)} font-bold text-sm`}>
                      {getInitials(owner.firstName, owner.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{owner.firstName} {owner.lastName}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Cliente #{owner.id}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedOwner(owner); setIsDetailsOpen(true); }}>
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedOwner(owner); setIsDetailsOpen(true); }}>
                            Editar Información
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline" className="font-mono font-normal text-xs">
                          {owner.documentType} {owner.documentNumber}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate text-xs">{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-xs">{owner.phone}</span>
                      </div>
                      {owner.city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs truncate">{owner.city}, {owner.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground px-2">
        <p>Total: {owners.length} clientes</p>
        <p className="hidden sm:inline">Base de datos sincronizada</p>
      </div>

      {selectedOwner && (
        <OwnerDetailsDialog
          owner={selectedOwner}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onUpdate={loadOwners}
        />
      )}
    </div>
  );
}