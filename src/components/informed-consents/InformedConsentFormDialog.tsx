import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { patientService, ownerService, userService } from '@/services';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface InformedConsentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (consent: any) => void;
  consent?: any;
}

export function InformedConsentFormDialog({ open, onClose, onSubmit, consent }: InformedConsentFormDialogProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    ownerId: '',
    veterinarianId: user?.id || '',
    appointmentId: '',
    procedureType: '',
    procedureDescription: '',
    risks: '',
    benefits: '',
    alternatives: '',
  });

  useEffect(() => {
    if (open) {
      loadPatients();
      loadOwners();
      loadVeterinarians();
      if (consent) {
        setFormData({
          patientId: consent.patientId?.toString() || '',
          ownerId: consent.ownerId?.toString() || '',
          veterinarianId: consent.veterinarianId?.toString() || user?.id || '',
          appointmentId: consent.appointmentId?.toString() || '',
          procedureType: consent.procedureType || '',
          procedureDescription: consent.procedureDescription || consent.description || '',
          risks: consent.risks || '',
          benefits: consent.benefits || '',
          alternatives: consent.alternatives || '',
        });
      } else {
        setFormData({
          patientId: '',
          ownerId: '',
          veterinarianId: user?.id || '',
          appointmentId: '',
          procedureType: '',
          procedureDescription: '',
          risks: '',
          benefits: '',
          alternatives: '',
        });
      }
    }
  }, [open, consent, user]);

  const loadPatients = async () => {
    try {
      const response = await patientService.getAll(0, 100);
      setPatients(response.content || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const loadOwners = async () => {
    try {
      const response = await ownerService.getAll(0, 100);
      setOwners(response.content || []);
    } catch (error) {
      console.error('Error al cargar propietarios:', error);
    }
  };

  const loadVeterinarians = async () => {
    try {
      const vets = await userService.getVeterinarians();
      setVeterinarians(vets);
    } catch (error) {
      console.error('Error al cargar veterinarios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.ownerId || !formData.veterinarianId || !formData.procedureType || !formData.procedureDescription) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const consentData = {
        patientId: parseInt(formData.patientId),
        ownerId: parseInt(formData.ownerId),
        veterinarianId: formData.veterinarianId,
        appointmentId: formData.appointmentId ? parseInt(formData.appointmentId) : undefined,
        procedureType: formData.procedureType,
        procedureDescription: formData.procedureDescription,
        risks: formData.risks || undefined,
        benefits: formData.benefits || undefined,
        alternatives: formData.alternatives || undefined,
      };

      await onSubmit(consentData);
    } catch (error) {
      console.error('Error al guardar consentimiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const procedureTypes = [
    'SURGERY',
    'ANESTHESIA',
    'VACCINATION',
    'DIAGNOSTIC',
    'TREATMENT',
    'OTHER',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{consent ? 'Editar Consentimiento' : 'Nuevo Consentimiento Informado'}</DialogTitle>
          <DialogDescription>
            {consent ? 'Modifica los datos del consentimiento' : 'Completa los datos para crear un nuevo consentimiento informado'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                required
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

            <div className="space-y-2">
              <Label htmlFor="ownerId">Propietario *</Label>
              <Select
                value={formData.ownerId}
                onValueChange={(value) => setFormData({ ...formData, ownerId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un propietario" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id.toString()}>
                      {owner.firstName} {owner.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarianId">Veterinario *</Label>
              <Select
                value={formData.veterinarianId}
                onValueChange={(value) => setFormData({ ...formData, veterinarianId: value })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un veterinario" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {veterinarians.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      No hay veterinarios disponibles
                    </SelectItem>
                  ) : (
                    veterinarians.map((vet) => (
                      <SelectItem key={vet.id} value={vet.id}>
                        {vet.firstName} {vet.lastName} {vet.username ? `(${vet.username})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedureType">Tipo de Procedimiento *</Label>
              <Select
                value={formData.procedureType}
                onValueChange={(value) => setFormData({ ...formData, procedureType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {procedureTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'SURGERY' && 'Cirugía'}
                      {type === 'ANESTHESIA' && 'Anestesia'}
                      {type === 'VACCINATION' && 'Vacunación'}
                      {type === 'DIAGNOSTIC' && 'Diagnóstico'}
                      {type === 'TREATMENT' && 'Tratamiento'}
                      {type === 'OTHER' && 'Otro'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedureDescription">Descripción del Procedimiento *</Label>
            <Textarea
              id="procedureDescription"
              value={formData.procedureDescription}
              onChange={(e) => setFormData({ ...formData, procedureDescription: e.target.value })}
              placeholder="Describe detalladamente el procedimiento..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risks">Riesgos</Label>
            <Textarea
              id="risks"
              value={formData.risks}
              onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
              placeholder="Describe los riesgos asociados al procedimiento..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Beneficios</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="Describe los beneficios esperados..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternatives">Alternativas</Label>
            <Textarea
              id="alternatives"
              value={formData.alternatives}
              onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
              placeholder="Describe las alternativas disponibles..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : consent ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

