import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserRole } from '@/contexts/AuthContext';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<User, 'id'>) => void;
  initialData?: User;
}

export function UserFormDialog({ open, onOpenChange, onSubmit, initialData }: UserFormDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Omit<User, 'id'> & { password?: string }>({
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      role: 'receptionist',
      password: '',
    },
  });

  const role = watch('role');

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          username: initialData.username,
          email: initialData.email,
          fullName: initialData.fullName,
          role: initialData.role,
          password: '', // No pre-fill password when editing
        });
      } else {
        reset({
          username: '',
          email: '',
          fullName: '',
          role: 'receptionist',
          password: '',
        });
      }
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Usuario' : 'Agregar Usuario'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Modifica la información del usuario' : 'Completa los datos del nuevo usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nombre Completo *</Label>
            <Input
              id="fullName"
              {...register('fullName', { required: 'El nombre es requerido' })}
              placeholder="Ej: Dr. Juan Pérez"
            />
            {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <Label htmlFor="username">Nombre de Usuario *</Label>
            <Input
              id="username"
              {...register('username', { required: 'El nombre de usuario es requerido' })}
              placeholder="Ej: jperez"
            />
            {errors.username && <p className="text-sm text-destructive mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              placeholder="usuario@vetclinic.com"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>

          {!initialData && (
            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { 
                  required: initialData ? false : 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                El usuario usará esta contraseña para iniciar sesión
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="role">Rol *</Label>
            <Select value={role} onValueChange={(value) => setValue('role', value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="veterinarian">Veterinario</SelectItem>
                <SelectItem value="receptionist">Recepcionista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Permisos por rol:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Administrador:</strong> Acceso completo al sistema</li>
              <li><strong>Veterinario:</strong> Gestión de pacientes e historias clínicas</li>
              <li><strong>Recepcionista:</strong> Gestión de citas y propietarios</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Guardar Cambios' : 'Agregar Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
