import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Prescription } from '@/services/prescriptionService';
import { Download, FileText, Edit, Trash2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PrescriptionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  prescription?: Prescription;
  onEdit?: (prescription: Prescription) => void;
  onDelete?: (id: number) => void;
  onExport?: (id: number, format: 'PDF' | 'EXCEL') => void;
}

export function PrescriptionDetailsDialog({
  open,
  onClose,
  prescription,
  onEdit,
  onDelete,
  onExport,
}: PrescriptionDetailsDialogProps) {
  if (!prescription) return null;

  const getStatusBadge = (prescription: Prescription) => {
    if (prescription.isExpired) {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    if (prescription.isCurrentlyActive) {
      return <Badge variant="default">Activa</Badge>;
    }
    if (prescription.status) {
      const variants = {
        ACTIVE: { label: 'Activa', variant: 'default' as const },
        COMPLETED: { label: 'Completada', variant: 'outline' as const },
        CANCELLED: { label: 'Cancelada', variant: 'destructive' as const },
      };
      const config = variants[prescription.status] || variants.ACTIVE;
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
    return <Badge variant="secondary">Sin estado</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl">Detalles de la Prescripción</DialogTitle>
              <DialogDescription className="mt-1">Información completa de la prescripción médica</DialogDescription>
            </div>
            <div className="shrink-0">
              {getStatusBadge(prescription)}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Medicamento</h3>
                <p className="text-base sm:text-lg font-semibold break-words">{prescription.medicationName || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Paciente</h3>
                <p className="text-base sm:text-lg break-words">{prescription.patientName || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Dosis</h3>
                <p className="text-base break-words">{prescription.dosage || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Frecuencia</h3>
                <p className="text-base break-words">{prescription.frequency || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Duración</h3>
                <p className="text-base break-words">{prescription.duration || 'N/A'}</p>
              </div>
            </div>

            {prescription.startDate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Inicio</h3>
                  <p className="text-sm sm:text-base break-words">
                    {format(new Date(prescription.startDate), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
                {prescription.endDate && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Fin</h3>
                    <p className="text-sm sm:text-base break-words">
                      {format(new Date(prescription.endDate), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {prescription.instructions && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Instrucciones</h3>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{prescription.instructions}</p>
                </div>
              </div>
            )}

            {prescription.prescribedBy && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Prescrito por</h3>
                <p className="text-base break-words">{prescription.prescribedBy}</p>
              </div>
            )}

            {prescription.createdAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Creación</h3>
                <p className="text-sm sm:text-base break-words">
                  {format(new Date(prescription.createdAt), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-background shrink-0">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {onExport && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const blob = await onExport(prescription.id, 'PDF');
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, '_blank');
                      } catch (error) {
                        // Error ya manejado
                      }
                    }}
                    title="Ver PDF"
                    className="flex-1 sm:flex-none"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Ver PDF</span>
                    <span className="sm:hidden">Ver</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const blob = await onExport(prescription.id, 'PDF');
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `Receta_${prescription.id}_${new Date().getTime()}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        // Error ya manejado
                      }
                    }}
                    title="Descargar PDF"
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const blob = await onExport(prescription.id, 'PDF');
                        const url = window.URL.createObjectURL(blob);
                        const printWindow = window.open(url, '_blank');
                        if (printWindow) {
                          printWindow.onload = () => {
                            printWindow.print();
                          };
                        }
                      } catch (error) {
                        // Error ya manejado
                      }
                    }}
                    title="Imprimir PDF"
                    className="flex-1 sm:flex-none"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(prescription)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={() => onDelete(prescription.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              )}
              <Button size="sm" onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

