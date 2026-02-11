import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, FileText, Calendar, Hash, Trash2, Edit } from 'lucide-react';
import { OwnerFormDialog } from './OwnerFormDialog';
import { ownerService } from '@/services/ownerService';
import { toast } from 'sonner';
import type { Owner } from '@/types/owner';

interface OwnerDetailsDialogProps {
  owner: Owner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function OwnerDetailsDialog({
  owner,
  open,
  onOpenChange,
  onUpdate,
}: Readonly<OwnerDetailsDialogProps>) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      CC: 'Cédula de Ciudadanía',
      CE: 'Cédula de Extranjería',
      TI: 'Tarjeta de Identidad',
      PAS: 'Pasaporte',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await ownerService.delete(owner.id);
      toast.success('Propietario eliminado exitosamente');
      onOpenChange(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Error al eliminar propietario:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el propietario');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    if (onUpdate) onUpdate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {owner.firstName} {owner.lastName}
            </DialogTitle>
            <DialogDescription>
              Información detallada del propietario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="font-medium">Documento</span>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1">
                    {getDocumentTypeLabel(owner.documentType)}
                  </Badge>
                  <p className="text-sm">{owner.documentNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Registro</span>
                </div>
                <p className="text-sm">
                  {new Date(owner.createdAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información de Contacto</h3>

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{owner.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-sm">{owner.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p className="text-sm">{owner.address}</p>
                    <p className="text-sm text-muted-foreground">{owner.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {owner.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Notas</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {owner.notes}
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteAlert(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <OwnerFormDialog
        owner={owner}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al propietario{' '}
              <strong>{owner.firstName} {owner.lastName}</strong> y toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
