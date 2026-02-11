import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type InventoryItem } from '@/services';

interface InventoryFormData {
  name: string;
  category: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit: string;
  minStock?: number;
  minQuantity?: number;
  price?: number;
  unitPrice?: number;
  supplier?: string;
  expirationDate?: string;
  location?: string;
}

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InventoryFormData) => void;
  initialData?: Partial<InventoryItem & { status?: string }>;
}

export function InventoryFormDialog({ open, onOpenChange, onSubmit, initialData }: InventoryFormDialogProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InventoryFormData>({
    defaultValues: initialData ? {
      name: initialData.name || '',
      category: initialData.category || 'MEDICATION',
      description: initialData.description || '',
      sku: initialData.sku || '',
      quantity: initialData.quantity || 0,
      unit: initialData.unit || '',
      minStock: initialData.minQuantity || 0,
      minQuantity: initialData.minQuantity || 0,
      price: initialData.unitPrice || 0,
      unitPrice: initialData.unitPrice || 0,
      supplier: initialData.supplier || '',
      expirationDate: initialData.expirationDate || '',
      location: initialData.location || '',
    } : {
      name: '',
      category: 'MEDICATION',
      description: '',
      quantity: 0,
      unit: '',
      minStock: 0,
      supplier: '',
      price: 0,
      expirationDate: '',
    },
  });

  const category = watch('category');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{initialData ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
          <DialogDescription className="text-sm">
            {initialData ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
                placeholder="Ej: Antibiótico Amoxicilina"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select value={category} onValueChange={(value) => setValue('category', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICATION">Medicamento</SelectItem>
                  <SelectItem value="SUPPLY">Material/Suministro</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipo</SelectItem>
                  <SelectItem value="FOOD">Alimento</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplier">Proveedor *</Label>
              <Input
                id="supplier"
                {...register('supplier', { required: 'El proveedor es requerido' })}
                placeholder="Nombre del proveedor"
              />
              {errors.supplier && <p className="text-sm text-destructive mt-1">{errors.supplier.message}</p>}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción del producto"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad Actual *</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { required: 'La cantidad es requerida', valueAsNumber: true })}
                placeholder="0"
              />
              {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
            </div>

            <div>
              <Label htmlFor="unit">Unidad de Medida *</Label>
              <Input
                id="unit"
                {...register('unit', { required: 'La unidad es requerida' })}
                placeholder="Ej: kg, ml, unidades"
              />
              {errors.unit && <p className="text-sm text-destructive mt-1">{errors.unit.message}</p>}
            </div>

            <div>
              <Label htmlFor="minStock">Stock Mínimo *</Label>
              <Input
                id="minStock"
                type="number"
                {...register('minStock', { required: 'El stock mínimo es requerido', valueAsNumber: true })}
                placeholder="0"
              />
              {errors.minStock && <p className="text-sm text-destructive mt-1">{errors.minStock.message}</p>}
            </div>

            <div>
              <Label htmlFor="price">Precio Unitario ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                {...register('price', { 
                  required: 'El precio es requerido', 
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                })}
                placeholder="0.00"
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register('expirationDate')}
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ej: Estante A3"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Guardar Cambios' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
