import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClinicService } from '@/services/clinicService';
import { Edit, Trash2 } from 'lucide-react';

interface ServiceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  service?: ClinicService;
  onEdit?: (service: ClinicService) => void;
  onDelete?: (id: number) => void;
}

export function ServiceDetailsDialog({
  open,
  onClose,
  service,
  onEdit,
  onDelete,
}: ServiceDetailsDialogProps) {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{service.name}</DialogTitle>
              <DialogDescription>Detalles del servicio</DialogDescription>
            </div>
            <Badge variant={service.isActive ? 'default' : 'secondary'}>
              {service.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Categoría</h3>
            <Badge variant="outline">{service.category}</Badge>
          </div>

          {service.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
              <p className="text-base">{service.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Precio</h3>
              <p className="text-lg font-semibold">
                ${service.price?.toLocaleString('es-CO') || '0'}
              </p>
            </div>
            {service.durationMinutes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Duración</h3>
                <p className="text-lg">{service.durationMinutes} minutos</p>
              </div>
            )}
          </div>

          {service.createdAt && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Creación</h3>
              <p className="text-base">
                {new Date(service.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(service)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(service.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

