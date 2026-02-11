import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, UserCircle, Shield, Stethoscope, 
  Headphones, MoreVertical, Mail, Hash, UserCheck, UserX 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { UserDetailsDialog } from '@/components/users/UserDetailsDialog';
import { User, UserRole } from '@/contexts/AuthContext';
import { userService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Configuración de traducción de roles
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  VETERINARIAN: 'Veterinario',
  RECEPTIONIST: 'Recepcionista',
  OWNER: 'Propietario',
  // También soportar versiones en minúsculas
  admin: 'Administrador',
  veterinarian: 'Veterinario',
  receptionist: 'Recepcionista',
  owner: 'Propietario',
};

const getRoleLabel = (role: string | undefined): string => {
  if (!role) return 'Sin rol';
  return roleLabels[role.toUpperCase()] || roleLabels[role] || role;
};

// Helpers visuales
const getRoleIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin')) return <Shield className="h-4 w-4" />;
    if (r.includes('veterinarian')) return <Stethoscope className="h-4 w-4" />;
    if (r.includes('receptionist')) return <Headphones className="h-4 w-4" />;
    return <UserCircle className="h-4 w-4" />;
};

const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (r.includes('veterinarian')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (r.includes('receptionist')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const page = await userService.getAll(0, 100, searchTerm);
      setUsers(page.content);
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
      return users.filter(user => {
        const matchesSearch = (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
      });
  }, [users, searchTerm, roleFilter]);

  // Actions
  const handleAddUser = async (data: any) => {
      try {
          await userService.create({ ...data, roles: [data.role.toUpperCase()] });
          toast({ title: 'Usuario creado', description: 'Credenciales enviadas.' });
          setIsFormOpen(false); loadUsers();
      } catch (error) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleDeleteUser = async (id: string) => {
      try {
          await userService.delete(id);
          toast({ title: 'Usuario eliminado' });
          setIsDetailsOpen(false); loadUsers();
      } catch (error) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Equipo & Accesos <Shield className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra roles, permisos y miembros del equipo.
          </p>
        </div>
        <Button onClick={() => { setSelectedUser(null); setIsFormOpen(true); }} className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <Plus className="mr-2 h-4 w-4" /> Invitar Miembro
        </Button>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/40 p-2 rounded-xl border sticky top-4 z-20 backdrop-blur-md">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nombre, email o cargo..." 
                className="pl-10 bg-background border-none shadow-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background border-none shadow-sm h-10">
                <SelectValue placeholder="Filtrar por Rol" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="veterinarian">Veterinarios</SelectItem>
                <SelectItem value="receptionist">Recepción</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* --- TEAM GRID --- */}
      {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1,2,3,4].map(i => <div key={i} className="h-60 bg-muted/20 rounded-2xl animate-pulse" />)}
          </div>
      ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted rounded-3xl bg-muted/5">
              <UserCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No se encontraron usuarios</p>
          </div>
      ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                  {filteredUsers.map((user) => (
                      <motion.div
                          key={user.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                      >
                          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border h-full">
                              {/* Background Pattern */}
                              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 transition-colors" />
                              
                              <CardContent className="p-6 flex flex-col items-center text-center relative pt-12">
                                  
                                  {/* Avatar */}
                                  <div className="relative mb-4">
                                      <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                                          <AvatarFallback className="bg-slate-100 text-slate-500 text-lg font-bold">
                                              {getInitials(user.fullName)}
                                          </AvatarFallback>
                                      </Avatar>
                                      {/* Status Dot */}
                                      <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background ${user.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                  </div>

                                  <h3 className="font-bold text-lg text-foreground mb-1">{user.fullName}</h3>
                                  <p className="text-sm text-muted-foreground mb-4">@{user.username}</p>

                                  <Badge variant="secondary" className={`mb-6 px-3 py-1 ${getRoleColor(user.role)}`}>
                                      <span className="mr-1.5">{getRoleIcon(user.role)}</span>
                                      {getRoleLabel(user.role)}
                                  </Badge>

                                  <div className="w-full pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1.5" title={user.email}>
                                          <Mail className="w-3.5 h-3.5" /> 
                                          <span className="truncate max-w-[120px]">{user.email}</span>
                                      </div>
                                      
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                                  <MoreVertical className="w-4 h-4" />
                                              </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}>
                                                  Ver Perfil
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsFormOpen(true); }}>
                                                  Editar Permisos
                                              </DropdownMenuItem>
                                              {user.isActive !== false ? (
                                                  <DropdownMenuItem className="text-orange-600">
                                                      <UserX className="w-4 h-4 mr-2" /> Desactivar
                                                  </DropdownMenuItem>
                                              ) : (
                                                  <DropdownMenuItem className="text-emerald-600">
                                                      <UserCheck className="w-4 h-4 mr-2" /> Activar
                                                  </DropdownMenuItem>
                                              )}
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </div>

                              </CardContent>
                          </Card>
                      </motion.div>
                  ))}
              </AnimatePresence>
          </div>
      )}

      {/* DIALOGS */}
      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={selectedUser ? (data) => {/* edit logic */} : handleAddUser}
        initialData={selectedUser || undefined}
      />

      <UserDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        user={selectedUser}
        onEdit={(user) => { setSelectedUser(user); setIsFormOpen(true); setIsDetailsOpen(false); }}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}