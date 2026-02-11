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
import { Patient, Species, Sex } from '@/types/patient';
import { ownerService } from '@/services/ownerService';
import type { Owner } from '@/types/owner';
import { toast } from 'sonner';

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (patient: any) => void;
  patient?: Patient;
}

export function PatientFormDialog({ open, onClose, onSubmit, patient }: PatientFormDialogProps) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog' as Species,
    breed: '',
    age: '',
    weight: '',
    sex: 'male' as Sex,
    color: '',
    ownerName: '',
    ownerId: '',
    microchip: '',
    dateOfBirth: '',
    observations: '',
    isActive: true,
  });

  // Cargar propietarios al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadOwners();
    }
  }, [open]);

  const loadOwners = async () => {
    try {
      setLoadingOwners(true);
      const response = await ownerService.getAll(0, 100);
      setOwners(response.content);
    } catch (error) {
      console.error('Error al cargar propietarios:', error);
      toast.error('Error al cargar la lista de propietarios');
    } finally {
      setLoadingOwners(false);
    }
  };

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        species: patient.species,
        breed: patient.breed,
        age: patient.age.toString(),
        weight: patient.weight.toString(),
        sex: patient.sex,
        color: patient.color,
        ownerName: patient.ownerName,
        ownerId: patient.ownerId,
        microchip: patient.microchip || '',
        dateOfBirth: patient.dateOfBirth || '',
        observations: patient.observations || '',
        isActive: patient.isActive,
      });
    } else {
      setFormData({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        sex: 'male',
        color: '',
        ownerName: '',
        ownerId: '',
        microchip: '',
        dateOfBirth: '',
        observations: '',
        isActive: true,
      });
    }
  }, [patient, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.breed || !formData.weight) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!formData.ownerId) {
      toast.error('Por favor selecciona un propietario');
      return;
    }

    // Validar que la fecha de nacimiento sea en el pasado
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate >= today) {
        toast.error('La fecha de nacimiento debe ser en el pasado');
        return;
      }
    }

    // Transformar los datos al formato que espera el backend
    const patientData = {
      name: formData.name,
      species: formData.species.toUpperCase(), // Convertir a mayúsculas
      breed: formData.breed,
      birthDate: formData.dateOfBirth || null, // Cambiar de dateOfBirth a birthDate
      gender: formData.sex.toUpperCase(), // Cambiar de sex a gender y convertir a MALE/FEMALE
      color: formData.color || null,
      weight: parseFloat(formData.weight),
      microchipNumber: formData.microchip || null,
      allergies: null,
      medicalHistory: null,
      notes: formData.observations || null,
      ownerId: parseInt(formData.ownerId), // Convertir a número
      ...(patient && { id: patient.id }),
    };

    console.log('Enviando datos del paciente:', patientData); // Para debug
    onSubmit(patientData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{patient ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
          <DialogDescription className="text-sm">
            {patient
              ? 'Actualiza la información del paciente.'
              : 'Completa el formulario para registrar un nuevo paciente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la mascota"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Especie *</Label>
              <Select
                value={formData.species}
                onValueChange={(value: Species) => setFormData({ ...formData, species: value })}
              >
                <SelectTrigger id="species">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Perro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                  <SelectItem value="bird">Ave</SelectItem>
                  <SelectItem value="rabbit">Conejo</SelectItem>
                  <SelectItem value="hamster">Hámster</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="breed">Raza *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="Raza del animal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Color del pelaje"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="age">Edad (años) *</Label>
              <Input
                id="age"
                type="number"
                min="0"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sexo *</Label>
              <Select
                value={formData.sex}
                onValueChange={(value: Sex) => setFormData({ ...formData, sex: value })}
              >
                <SelectTrigger id="sex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Macho</SelectItem>
                  <SelectItem value="female">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerId">Propietario *</Label>
            <Select
              value={formData.ownerId}
              onValueChange={(value) => {
                const selectedOwner = owners.find(o => o.id === value);
                setFormData({
                  ...formData,
                  ownerId: value,
                  ownerName: selectedOwner ? `${selectedOwner.firstName} ${selectedOwner.lastName}` : ''
                });
              }}
            >
              <SelectTrigger id="ownerId">
                <SelectValue placeholder={loadingOwners ? "Cargando propietarios..." : "Selecciona un propietario"} />
              </SelectTrigger>
              <SelectContent>
                {owners.length === 0 && !loadingOwners && (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No hay propietarios registrados.
                    <br />
                    Crea uno primero en la sección Propietarios.
                  </div>
                )}
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={String(owner.id)}>
                    {owner.firstName} {owner.lastName} - {owner.documentNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="microchip">Microchip</Label>
              <Input
                id="microchip"
                value={formData.microchip}
                onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                placeholder="Número de microchip"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Alergias, comportamiento, notas especiales..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {patient ? 'Actualizar' : 'Crear'} Paciente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
