import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { medicalRecordService } from '@/services/medicalRecordService';
import { patientService } from '@/services';
import { inventoryService, type InventoryItem } from '@/services';
import { prescriptionService } from '@/services/prescriptionService';
import { toast } from 'sonner';
import { AlertCircle, Package } from 'lucide-react';

interface PrescriptionFormDialogProps {
  prescription?: any;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function PrescriptionFormDialog({ prescription, children, onSuccess }: PrescriptionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medications, setMedications] = useState<InventoryItem[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    medicalRecordId: '',
    patientId: '',
    medicationId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (open) {
      loadMedicalRecords();
      loadPatients();
      loadMedications();
      if (prescription) {
        setFormData({
          medicalRecordId: prescription.medicalRecordId?.toString() || '',
          patientId: prescription.patientId?.toString() || '',
          medicationId: prescription.medicationId?.toString() || '',
          medicationName: prescription.medicationName || '',
          dosage: prescription.dosage || '',
          frequency: prescription.frequency || '',
          duration: prescription.duration || '',
          instructions: prescription.instructions || '',
          startDate: prescription.startDate ? new Date(prescription.startDate).toISOString().slice(0, 16) : '',
          endDate: prescription.endDate ? new Date(prescription.endDate).toISOString().slice(0, 16) : '',
        });
      } else {
        setFormData({
          medicalRecordId: '',
          patientId: '',
          medicationId: '',
          medicationName: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          startDate: '',
          endDate: '',
        });
        setSelectedMedication(null);
      }
    }
  }, [open, prescription]);

  // Establecer el medicamento seleccionado cuando se carguen los medicamentos y haya un medicationId
  useEffect(() => {
    if (medications.length > 0 && formData.medicationId && !selectedMedication) {
      const med = medications.find(m => String(m.id) === formData.medicationId);
      if (med) {
        setSelectedMedication(med);
      }
    }
  }, [medications, formData.medicationId, selectedMedication]);

  const loadMedicalRecords = async () => {
    try {
      const response = await medicalRecordService.getAll(0, 100);
      setMedicalRecords(response.content || []);
    } catch (error) {
      console.error('Error al cargar historias clínicas:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientService.getAll(0, 100);
      setPatients(response.content || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const loadMedications = async () => {
    try {
      setLoadingData(true);
      // Intentar obtener medicamentos por categoría
      try {
        const response = await inventoryService.getByCategory('MEDICATION');
        setMedications(response || []);
      } catch (categoryError) {
        // Si falla, intentar obtener todos y filtrar
        console.warn('Error al obtener por categoría, intentando obtener todos:', categoryError);
        const allResponse = await inventoryService.getAll(0, 1000);
        const medications = (allResponse.content || []).filter(item => item.category === 'MEDICATION');
        setMedications(medications);
      }
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
      toast.error('Error al cargar medicamentos del inventario');
      setMedications([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleMedicationChange = (medicationId: string) => {
    const medication = medications.find(m => String(m.id) === medicationId);
    if (medication) {
      setSelectedMedication(medication);
      setFormData({
        ...formData,
        medicationId: String(medication.id),
        medicationName: medication.name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicalRecordId || !formData.patientId || !formData.medicationId) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    // Validar stock
    if (!selectedMedication) {
      toast.error('Por favor selecciona un medicamento');
      return;
    }

    if (selectedMedication.quantity <= 0) {
      toast.error(`El medicamento "${selectedMedication.name}" no tiene stock disponible`);
      return;
    }

    try {
      setLoading(true);
      const prescriptionData = {
        medicalRecordId: parseInt(formData.medicalRecordId),
        patientId: parseInt(formData.patientId),
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      if (prescription) {
        await prescriptionService.update(prescription.id, prescriptionData);
        toast.success('Prescripción actualizada exitosamente');
      } else {
        await prescriptionService.create(prescriptionData);
        toast.success('Prescripción creada exitosamente');
      }

      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error al guardar prescripción:', error);
      toast.error(error?.response?.data?.message || 'Error al guardar la prescripción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Nueva Prescripción</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prescription ? 'Editar Prescripción' : 'Nueva Prescripción'}</DialogTitle>
          <DialogDescription>
            {prescription ? 'Modifica los datos de la prescripción' : 'Completa los datos para crear una nueva prescripción'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicalRecordId">Historia Clínica *</Label>
              <Select
                value={formData.medicalRecordId}
                onValueChange={(value) => setFormData({ ...formData, medicalRecordId: value })}
                required
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una historia clínica" />
                </SelectTrigger>
                <SelectContent>
                  {medicalRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id.toString()}>
                      {record.patientName || `Historia #${record.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                required
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicationId">Medicamento *</Label>
            <Select
              value={formData.medicationId}
              onValueChange={handleMedicationChange}
              required
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingData ? "Cargando medicamentos..." : "Selecciona un medicamento del inventario"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {loadingData ? (
                  <SelectItem value="_loading" disabled>
                    Cargando medicamentos...
                  </SelectItem>
                ) : medications.length === 0 ? (
                  <SelectItem value="no-medications" disabled>
                    No hay medicamentos disponibles
                  </SelectItem>
                ) : (
                  medications.map((medication) => (
                    <SelectItem 
                      key={medication.id} 
                      value={String(medication.id)}
                      disabled={medication.quantity <= 0}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="flex-1 truncate">{medication.name}</span>
                        <Badge 
                          variant={medication.quantity <= 0 ? "destructive" : medication.quantity <= medication.minQuantity ? "secondary" : "default"}
                          className="shrink-0"
                        >
                          {medication.quantity <= 0 ? 'Sin stock' : `${medication.quantity} ${medication.unit || 'unidades'}`}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedMedication && (
              <div className={`mt-2 p-3 rounded-lg border flex items-start gap-2 ${
                selectedMedication.quantity <= 0 
                  ? 'bg-red-50 border-red-200' 
                  : selectedMedication.quantity <= selectedMedication.minQuantity
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                {selectedMedication.quantity <= 0 ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Sin stock disponible</p>
                      <p className="text-xs text-red-700">No se puede registrar este medicamento en la prescripción</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Stock disponible</p>
                      <p className="text-xs text-green-700">
                        Cantidad: <strong>{selectedMedication.quantity}</strong> {selectedMedication.unit || 'unidades'}
                        {selectedMedication.quantity <= selectedMedication.minQuantity && (
                          <span className="ml-2 text-yellow-700">(Stock bajo)</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosis *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="Ej: 500mg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia *</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="Ej: Cada 12 horas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Ej: 7 días"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instrucciones</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Instrucciones adicionales para el tratamiento..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || loadingData || (selectedMedication && selectedMedication.quantity <= 0)}
            >
              {loading ? 'Guardando...' : prescription ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

