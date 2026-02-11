import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Patient, Species } from '@/types/patient';
import { PawPrint, Calendar, Weight, Palette, User, Hash, FileText } from 'lucide-react';

interface PatientDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient;
}

const speciesLabels: Record<Species, string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  rabbit: 'Conejo',
  hamster: 'Hámster',
  other: 'Otro',
};

const speciesColors: Record<Species, string> = {
  dog: 'bg-primary/10 text-primary',
  cat: 'bg-secondary/10 text-secondary',
  bird: 'bg-info/10 text-info',
  rabbit: 'bg-warning/10 text-warning',
  hamster: 'bg-accent/10 text-accent',
  other: 'bg-muted text-muted-foreground',
};

export function PatientDetailsDialog({ open, onClose, patient }: PatientDetailsDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {patient.name}
                <Badge className={speciesColors[patient.species]}>
                  {speciesLabels[patient.species]}
                </Badge>
              </div>
              <p className="text-sm font-normal text-muted-foreground">{patient.breed}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Información Básica</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Edad:</span>
                  <span className="font-medium text-foreground">
                    {patient.age} {patient.age === 1 ? 'año' : 'años'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium text-foreground">{patient.weight} kg</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium text-foreground">{patient.color}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sexo:</span>
                  <span className="font-medium text-foreground capitalize">
                    {patient.sex === 'male' ? 'Macho' : 'Hembra'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Propietario</h4>
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <p className="font-medium text-foreground">{patient.ownerName}</p>
                <p className="text-sm text-muted-foreground">ID: {patient.ownerId}</p>
              </div>
            </div>
          </div>

          {(patient.microchip || patient.dateOfBirth) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Datos Adicionales</h4>
              <div className="space-y-2">
                {patient.microchip && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Microchip:</span>
                    <span className="font-mono text-foreground">{patient.microchip}</span>
                  </div>
                )}
                {patient.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Fecha de Nacimiento:</span>
                    <span className="font-medium text-foreground">
                      {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {patient.observations && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="h-4 w-4" />
                Observaciones
              </h4>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm text-foreground">{patient.observations}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Historial</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between rounded-lg border border-border bg-muted/50 p-3">
                <span className="text-muted-foreground">Registro:</span>
                <span className="font-medium text-foreground">
                  {new Date(patient.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              {patient.lastVisit && (
                <div className="flex justify-between rounded-lg border border-border bg-muted/50 p-3">
                  <span className="text-muted-foreground">Última visita:</span>
                  <span className="font-medium text-foreground">
                    {new Date(patient.lastVisit).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
