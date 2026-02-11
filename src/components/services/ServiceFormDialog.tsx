import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ClinicService } from '@/services/clinicService';
import { toast } from 'sonner';

interface ServiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (service: any) => void;
  service?: ClinicService;
}

export function ServiceFormDialog({ open, onClose, onSubmit, service }: ServiceFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    durationMinutes: '',
    requiresAppointment: true,
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      if (service) {
        setFormData({
          name: service.name || '',
          description: service.description || '',
          category: service.category || '',
          price: service.price?.toString() || '',
          durationMinutes: service.durationMinutes?.toString() || '',
          requiresAppointment: service.requiresAppointment !== undefined ? service.requiresAppointment : true,
          isActive: service.isActive !== undefined ? service.isActive : true,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          category: '',
          price: '',
          durationMinutes: '',
          requiresAppointment: true,
          isActive: true,
        });
      }
    }
  }, [open, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price || !formData.durationMinutes) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const durationValue = parseInt(formData.durationMinutes);
    if (isNaN(durationValue) || durationValue < 1) {
      toast.error('La duración debe ser un número mayor a 0');
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('El precio debe ser un número mayor a 0');
      return;
    }

    try {
      setLoading(true);
      const serviceData = {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        price: priceValue,
        durationMinutes: durationValue,
        requiresAppointment: formData.requiresAppointment,
        ...(service && { isActive: formData.isActive }),
      };

      await onSubmit(serviceData);
    } catch (error: any) {
      console.error('Error al guardar servicio:', error);
      // El error ya se maneja en la página padre
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Consultas',
    'Vacunaciones',
    'Cirugías',
    'Laboratorio',
    'Radiología',
    'Estética',
    'Emergencias',
    'Otros',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
          <DialogDescription>
            {service ? 'Modifica los datos del servicio' : 'Completa los datos para crear un nuevo servicio'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Servicio *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Consulta Veterinaria General"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada del servicio..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duración (minutos) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="1"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                placeholder="30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiresAppointment">Requiere Cita</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="requiresAppointment"
                  checked={formData.requiresAppointment}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresAppointment: checked })}
                />
                <Label htmlFor="requiresAppointment" className="text-sm font-normal">
                  {formData.requiresAppointment ? 'Sí' : 'No'}
                </Label>
              </div>
            </div>
          </div>

          {service && (
            <div className="space-y-2">
              <Label htmlFor="isActive">Estado</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  {formData.isActive ? 'Activo' : 'Inactivo'}
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : service ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

