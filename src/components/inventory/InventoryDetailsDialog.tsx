import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Package, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { type InventoryItem } from '@/services';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type InventoryStatus = 'disponible' | 'bajo_stock' | 'agotado';
type InventoryItemDisplay = InventoryItem & { status?: InventoryStatus; supplier: string };

// Configuración de traducción de categorías de inventario
const categoryLabels: Record<string, string> = {
  MEDICATION: 'Medicamento',
  SUPPLY: 'Insumo',
  EQUIPMENT: 'Equipo',
  FOOD: 'Alimento',
  OTHER: 'Otro',
  // También soportar las versiones en español por si acaso
  medicamento: 'Medicamento',
  material: 'Insumo',
  alimento: 'Alimento',
  equipo: 'Equipo',
  otro: 'Otro',
};

const getCategoryLabel = (category: string | undefined): string => {
  if (!category) return 'Sin categoría';
  return categoryLabels[category] || category;
};

interface InventoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemDisplay | null;
  onEdit: (item: InventoryItemDisplay) => void;
  onDelete: (id: string) => void;
}

export function InventoryDetailsDialog({ open, onOpenChange, item, onEdit, onDelete }: InventoryDetailsDialogProps) {
  if (!item) return null;

  const getStatusBadge = (status?: InventoryStatus) => {
    if (!status) return null;
    const variants = {
      disponible: 'default',
      bajo_stock: 'secondary',
      agotado: 'destructive',
    };
    const labels = {
      disponible: 'Disponible',
      bajo_stock: 'Bajo Stock',
      agotado: 'Agotado',
    };
    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
  };

  const totalValue = item.quantity * (item.unitPrice || 0);
  const isExpiringSoon = item.expirationDate &&
    new Date(item.expirationDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{item.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{item.description}</p>
              <div className="flex gap-2 mt-3">
                {getStatusBadge(item.status)}
                <Badge variant="outline" className="capitalize">{getCategoryLabel(item.category)}</Badge>
              </div>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {(item.status === 'bajo_stock' || item.status === 'agotado' || isExpiringSoon) && (
            <div className="rounded-lg border border-warning bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-1">
                  {item.status === 'agotado' && (
                    <p className="text-sm font-medium text-foreground">Stock agotado - Se requiere reposición urgente</p>
                  )}
                  {item.status === 'bajo_stock' && (
                    <p className="text-sm font-medium text-foreground">Stock bajo - Considerar reposición pronto</p>
                  )}
                  {isExpiringSoon && (
                    <p className="text-sm font-medium text-foreground">Producto próximo a vencer</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Información de Stock</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cantidad Actual:</span>
                  <span className="font-semibold text-foreground">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock Mínimo:</span>
                  <span className="font-semibold text-foreground">{item.minQuantity} {item.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unidad:</span>
                  <span className="font-semibold text-foreground capitalize">{item.unit}</span>
                </div>
                {item.location && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ubicación:</span>
                    <span className="font-semibold text-foreground">{item.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Información Financiera</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Precio Unitario:</span>
                  <span className="font-semibold text-foreground">${item.unitPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor Total:</span>
                  <span className="font-semibold text-primary">${totalValue.toFixed(2)}</span>
                </div>
                {item.supplier && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Proveedor:</span>
                    <span className="font-semibold text-foreground">{item.supplier}</span>
                  </div>
                )}
                {item.sku && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SKU:</span>
                    <span className="font-semibold text-foreground">{item.sku}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Fechas</h3>
            <div className="grid grid-cols-2 gap-4">
              {item.createdAt && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de Registro</p>
                    <p className="text-sm font-semibold text-foreground">
                      {format(new Date(item.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              )}
              {item.expirationDate && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vencimiento</p>
                    <p className={`text-sm font-semibold ${isExpiringSoon ? 'text-warning' : 'text-foreground'}`}>
                      {format(new Date(item.expirationDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (confirm('¿Estás seguro de eliminar este producto del inventario?')) {
                  onDelete(item.id);
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
