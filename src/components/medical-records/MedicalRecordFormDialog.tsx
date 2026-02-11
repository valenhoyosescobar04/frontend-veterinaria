import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { medicalRecordService } from '@/services/medicalRecordService';
import { patientService } from '@/services/patientService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { MedicalRecord } from '@/types/medicalRecord';

const formSchema = z.object({
  patientId: z.string().min(1, 'Seleccione un paciente'),
  veterinarianId: z.string().min(1, 'Seleccione un veterinario'),
  recordDate: z.string().min(1, 'Fecha y hora son requeridas'),
  diagnosis: z.string().min(10, 'Diagnóstico debe tener al menos 10 caracteres'),
  treatment: z.string().min(10, 'Tratamiento debe tener al menos 10 caracteres'),
  symptoms: z.string().optional(),
  vitalSigns: z.string().optional(),
  weight: z.string().optional(),
  temperature: z.string().optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MedicalRecordFormDialogProps {
  record?: MedicalRecord;
  children?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MedicalRecordFormDialog({ 
  record, 
  children, 
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: MedicalRecordFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: record ? {
      patientId: record.patientId.toString(),
      veterinarianId: record.veterinarianId,
      recordDate: record.recordDate,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      symptoms: record.symptoms || '',
      vitalSigns: record.vitalSigns || '',
      weight: record.weight?.toString() || '',
      temperature: record.temperature?.toString() || '',
      notes: record.notes || '',
      followUpRequired: record.followUpRequired || false,
      followUpDate: record.followUpDate || '',
    } : {
      patientId: '',
      veterinarianId: user?.id || '',
      recordDate: new Date().toISOString().slice(0, 16),
      diagnosis: '',
      treatment: '',
      symptoms: '',
      vitalSigns: '',
      weight: '',
      temperature: '',
      notes: '',
      followUpRequired: false,
      followUpDate: '',
    },
  });

  // Cargar DATOS REALES cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      loadRealData();
      // Si hay un record, actualizar el formulario con sus valores
      if (record) {
        form.reset({
          patientId: record.patientId.toString(),
          veterinarianId: record.veterinarianId,
          recordDate: record.recordDate ? new Date(record.recordDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          diagnosis: record.diagnosis || '',
          treatment: record.treatment || '',
          symptoms: record.symptoms || '',
          vitalSigns: record.vitalSigns || '',
          weight: record.weight?.toString() || '',
          temperature: record.temperature?.toString() || '',
          notes: record.notes || '',
          followUpRequired: record.followUpRequired || false,
          followUpDate: record.followUpDate ? new Date(record.followUpDate).toISOString().slice(0, 16) : '',
        });
      }
    }
  }, [open, record]);

  const loadRealData = async () => {
    setLoadingData(true);
    try {
      console.log('🔄 Cargando PACIENTES REALES desde backend...');
      const patientsResponse = await patientService.getAll(0, 100);
      console.log('✅ Pacientes:', patientsResponse.content);
      setPatients(patientsResponse.content || []);

      console.log('🔄 Cargando veterinarios desde backend...');
      const vetsResponse = await userService.getVeterinarians();
      console.log('✅ Veterinarios:', vetsResponse);
      setVeterinarians(vetsResponse || []);

      if (user && !record) {
        form.setValue('veterinarianId', user.id);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      toast.error('Error al cargar datos del formulario');
      setPatients([]);
      setVeterinarians([]);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const payload = {
        patientId: parseInt(data.patientId), // Convertir a número
        veterinarianId: data.veterinarianId,
        recordDate: data.recordDate,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        symptoms: data.symptoms || undefined,
        vitalSigns: data.vitalSigns || undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        temperature: data.temperature ? parseFloat(data.temperature) : undefined,
        notes: data.notes || undefined,
        followUpRequired: data.followUpRequired,
        followUpDate: data.followUpRequired && data.followUpDate ? data.followUpDate : undefined,
      };

      console.log('📤 Enviando al backend:', payload);

      if (record) {
        await medicalRecordService.update(record.id, payload);
        toast.success('Historia clínica actualizada');
      } else {
        await medicalRecordService.create(payload);
        toast.success('Historia clínica creada exitosamente');
      }

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {record ? 'Editar Historia Clínica' : 'Nueva Historia Clínica'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {record ? 'Actualiza el registro médico' : 'Registra una nueva atención veterinaria'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingData || !!record}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar paciente REAL" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingData ? (
                          <SelectItem value="_loading" disabled>Cargando pacientes...</SelectItem>
                        ) : patients.length === 0 ? (
                          <SelectItem value="_empty" disabled>No hay pacientes disponibles</SelectItem>
                        ) : (
                          patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} - {patient.species} ({patient.ownerName})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Datos cargados desde el backend
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="veterinarianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veterinario *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingData}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar veterinario REAL" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingData ? (
                          <SelectItem value="_loading" disabled>Cargando veterinarios...</SelectItem>
                        ) : veterinarians.length === 0 ? (
                          <SelectItem value="_empty" disabled>No hay veterinarios disponibles</SelectItem>
                        ) : (
                          veterinarians.map((vet) => (
                            <SelectItem key={vet.id} value={vet.id}>
                              {vet.firstName} {vet.lastName} - {vet.username}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Datos cargados desde el backend
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recordDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y Hora de Atención *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        max={new Date().toISOString().slice(0, 16)}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      No puede ser una fecha futura
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Seguimiento (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Debe ser una fecha futura
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Síntomas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa los síntomas observados..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg) - Opcional</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="25.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura (°C) - Opcional</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="38.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vitalSigns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signos Vitales - Opcional</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: FC: 90 lpm, FR: 30 rpm, Mucosas rosadas, TRC < 2seg..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Frecuencia cardíaca, respiratoria, mucosas, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Diagnóstico médico..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamiento *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el tratamiento indicado..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales - Opcional</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones, recomendaciones, etc..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followUpRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      ¿Requiere seguimiento?
                    </FormLabel>
                    <FormDescription>
                      Marque si el paciente necesita una consulta de seguimiento
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {record ? 'Actualizar' : 'Crear'} Historia Clínica
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
