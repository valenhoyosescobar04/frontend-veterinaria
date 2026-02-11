import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, UserCircle, Mail, Shield } from 'lucide-react';
import { User, UserRole } from '@/contexts/AuthContext';

// Configuración de traducción de roles
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  VETERINARIAN: 'Veterinario',
  RECEPTIONIST: 'Recepcionista',
  OWNER: 'Propietario',
  // También soportar versiones con ROLE_ prefix
  ROLE_ADMIN: 'Administrador',
  ROLE_VETERINARIAN: 'Veterinario',
  ROLE_RECEPTIONIST: 'Recepcionista',
  ROLE_OWNER: 'Propietario',
};

const getRoleLabel = (role: string | undefined): string => {
  if (!role) return 'Sin rol';
  const cleanRole = role.replace('ROLE_', '').toUpperCase();
  return roleLabels[role] || roleLabels[cleanRole] || roleLabels[`ROLE_${cleanRole}`] || role.replace('ROLE_', '');
};

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserDetailsDialog({ open, onOpenChange, user, onEdit, onDelete }: UserDetailsDialogProps) {
  if (!user) return null;

  const getRoleBadge = (role: UserRole | undefined) => {
    if (!role) return <Badge variant="outline">Sin rol</Badge>;
    
    const config = {
      admin: { label: 'Administrador', variant: 'default' as const },
      veterinarian: { label: 'Veterinario', variant: 'secondary' as const },
      receptionist: { label: 'Recepcionista', variant: 'outline' as const },
    };
    const { label, variant } = config[role] || { label: 'Sin rol', variant: 'outline' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getRolePermissions = (role: UserRole | undefined) => {
    if (!role) return ['Sin permisos asignados'];
    
    const permissions = {
      admin: [
        'Acceso completo al sistema',
        'Gestión de usuarios y configuración',
        'Visualización de reportes y estadísticas',
        'Control total del inventario',
      ],
      veterinarian: [
        'Gestión de pacientes y propietarios',
        'Creación y edición de historias clínicas',
        'Programación de citas',
        'Consulta de inventario',
      ],
      receptionist: [
        'Gestión de citas',
        'Registro de propietarios',
        'Consulta de información de pacientes',
      ],
    };
    return permissions[role] || ['Sin permisos asignados'];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{user.fullName}</DialogTitle>
                <p className="text-muted-foreground mt-1">@{user.username}</p>
                <div className="mt-2">{getRoleBadge(user.role)}</div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Usuario</p>
                  <p className="text-sm font-semibold text-foreground">@{user.username}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Roles del Sistema</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role, index) => (
                  <Badge key={index} variant="secondary">
                    {getRoleLabel(role)}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">Sin roles asignados</Badge>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Permisos y Accesos</h3>
            </div>
            <ul className="space-y-2">
              {getRolePermissions(user.role).map((permission, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={() => {
                if (confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
                  onDelete(user.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
