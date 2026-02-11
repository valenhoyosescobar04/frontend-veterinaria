import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Calendar, 
    Clock, 
    Stethoscope, 
    FileText, 
    AlertCircle,
    Loader2,
    ArrowLeft,
    Sparkles,
    Check,
    CalendarDays,
    Info,
    ChevronRight,
    Dog,
    Cat,
    Bird,
    Rabbit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ownerPortalService } from '@/services/ownerPortalService';
import { userService } from '@/services/userService';
import type { Patient } from '@/types/patient';
import type { User } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- CONFIGURACIÓN & SCHEMA ---

const formSchema = z.object({
    patientId: z.string().min(1, 'Selecciona una mascota'),
    veterinarianId: z.string().min(1, 'Selecciona un veterinario'),
    scheduledDate: z.string().min(1, 'Fecha y hora son requeridas'),
    appointmentType: z.enum(['CONSULTATION', 'VACCINATION', 'SURGERY', 'CHECKUP', 'EMERGENCY'], {
        errorMap: () => ({ message: 'Selecciona el tipo de cita' }),
    }),
    reason: z.string().min(10, 'El motivo debe ser más detallado (mín. 10 caracteres)'),
    durationMinutes: z.number(),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const appointmentTypes = [
    { id: 'CONSULTATION', label: 'Consulta General', icon: '🩺', desc: 'Revisión médica estándar', color: 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white' },
    { id: 'VACCINATION', label: 'Vacunación', icon: '💉', desc: 'Refuerzos o esquema inicial', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { id: 'CHECKUP', label: 'Control / Chequeo', icon: '📋', desc: 'Seguimiento de tratamiento', color: 'bg-violet-50 border-violet-200 text-violet-700' },
    { id: 'SURGERY', label: 'Cirugía', icon: '🏥', desc: 'Procedimientos quirúrgicos', color: 'bg-rose-50 border-rose-200 text-rose-700' },
    { id: 'EMERGENCY', label: 'Urgencia', icon: '🚨', desc: 'Atención inmediata', color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

const getPetIcon = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes('dog') || s.includes('perro')) return <Dog className="w-5 h-5" />;
    if (s.includes('cat') || s.includes('gato')) return <Cat className="w-5 h-5" />;
    if (s.includes('bird') || s.includes('ave')) return <Bird className="w-5 h-5" />;
    if (s.includes('rabbit')) return <Rabbit className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
};

export default function OwnerBookAppointment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [pets, setPets] = useState<Patient[]>([]);
    const [veterinarians, setVeterinarians] = useState<User[]>([]);
    const [ownerId, setOwnerId] = useState<string>('');

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientId: '',
            veterinarianId: '',
            scheduledDate: '',
            appointmentType: 'CONSULTATION',
            reason: '',
            durationMinutes: 30,
            notes: '',
        },
    });

    // Watch values for Live Preview
    const watchAllFields = form.watch();
    const selectedPet = pets.find(p => p.id.toString() === watchAllFields.patientId);
    const selectedVet = veterinarians.find(v => v.id.toString() === watchAllFields.veterinarianId);
    const selectedTypeConfig = appointmentTypes.find(t => t.id === watchAllFields.appointmentType);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setInitialLoading(true);
            const userStr = localStorage.getItem('vetclinic_user');
            if (!userStr) {
                navigate('/login');
                return;
            }

            const localUser = JSON.parse(userStr);
            const fullUser = await userService.getByUsername(localUser.username);
            const ownerData = await ownerPortalService.getOwnerByUserId(fullUser.id);
            setOwnerId(ownerData.id);

            const [petsData, veterinariansData] = await Promise.all([
                ownerPortalService.getMyPets(),
                userService.getVeterinarians(),
            ]);

            console.log('Pets loaded:', petsData);
            console.log('Veterinarians loaded:', veterinariansData);

            setPets(petsData);
            setVeterinarians(veterinariansData || []);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando datos del sistema');
        } finally {
            setInitialLoading(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            
            // Validar que durationMinutes esté presente
            if (!data.durationMinutes || data.durationMinutes < 15) {
                toast.error('La duración debe ser al menos 15 minutos');
                setLoading(false);
                return;
            }
            
            // Validar que la fecha sea futura
            const dateObj = new Date(data.scheduledDate);
            const now = new Date();
            if (dateObj <= now) {
                toast.error('La fecha y hora de la cita debe ser futura');
                setLoading(false);
                return;
            }
            
            // Formatear la fecha correctamente (LocalDateTime sin timezone)
            // El formato debe ser YYYY-MM-DDTHH:mm:ss para LocalDateTime
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            
            console.log('Enviando cita:', {
                ownerId: parseInt(ownerId),
                patientId: parseInt(data.patientId),
                veterinarianId: data.veterinarianId,
                scheduledDate: formattedDate,
                appointmentType: data.appointmentType,
                reason: data.reason,
                durationMinutes: data.durationMinutes,
                notes: data.notes || '',
            });
            
            await ownerPortalService.createAppointment({
                ownerId: parseInt(ownerId),
                patientId: parseInt(data.patientId),
                veterinarianId: data.veterinarianId, // UUID como string
                scheduledDate: formattedDate,
                appointmentType: data.appointmentType,
                reason: data.reason,
                durationMinutes: data.durationMinutes,
                notes: data.notes || '',
            });

            toast.success('¡Cita agendada con éxito!');
            navigate('/owner/appointments');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error al crear la cita');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <LoadingScreen />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Nav Header */}
            <div className="flex items-center gap-4 border-b pb-6">
                <Link to="/owner/appointments">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nueva Cita</h1>
                    <p className="text-muted-foreground text-sm">Paso 1 de 1: Detalles de la reserva</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: FORM */}
                <div className="lg:col-span-8 space-y-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            
                            {/* 1. SELECCIÓN DE MASCOTA */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
                                    <h3>¿Quién es el paciente?</h3>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="patientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {pets.map((pet) => (
                                                    <div 
                                                        key={pet.id}
                                                        onClick={() => field.onChange(pet.id.toString())}
                                                        className={cn(
                                                            "cursor-pointer border rounded-xl p-4 transition-all hover:border-primary/50 hover:bg-muted/50 flex flex-col gap-2",
                                                            field.value === pet.id.toString() 
                                                                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                                                : "bg-card"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className={cn(
                                                                "p-2 rounded-lg",
                                                                field.value === pet.id.toString() ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {getPetIcon(pet.species)}
                                                            </div>
                                                            {field.value === pet.id.toString() && <Check className="h-4 w-4 text-primary" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{pet.name}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">{pet.species} • {pet.breed}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            <Separator />

                            {/* 2. TIPO DE CITA */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</div>
                                    <h3>Tipo de visita</h3>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="appointmentType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {appointmentTypes.map((type) => (
                                                    <div 
                                                        key={type.id}
                                                        onClick={() => field.onChange(type.id)}
                                                        className={cn(
                                                            "cursor-pointer border rounded-xl p-3 transition-all hover:-translate-y-0.5",
                                                            field.value === type.id 
                                                                ? cn("ring-2 ring-offset-1", type.color) 
                                                                : "bg-card hover:bg-muted/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{type.icon}</span>
                                                            <div>
                                                                <p className="font-semibold text-sm">{type.label}</p>
                                                                <p className="text-[10px] text-muted-foreground">{type.desc}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            <Separator />

                            {/* 3. DETALLES DE TIEMPO Y VETERINARIO */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">3</div>
                                    <h3>Agenda y Especialista</h3>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 p-6 bg-muted/20 rounded-xl border">
                                    <FormField
                                        control={form.control}
                                        name="veterinarianId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Veterinario</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder="Seleccionar especialista" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {veterinarians.length === 0 ? (
                                                            <SelectItem value="_empty" disabled>
                                                                No hay veterinarios disponibles
                                                            </SelectItem>
                                                        ) : (
                                                            veterinarians.map((vet) => (
                                                            <SelectItem key={vet.id} value={vet.id}>
                                                                    Dr. {vet.fullName || vet.username}
                                                            </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="scheduledDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha y Hora</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="datetime-local"
                                                            className="pl-9 bg-background"
                                                            min={new Date().toISOString().slice(0, 16)}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="durationMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duración Estimada</FormLabel>
                                                <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="15">15 min (Rápida)</SelectItem>
                                                        <SelectItem value="30">30 min (Estándar)</SelectItem>
                                                        <SelectItem value="60">60 min (Extensa)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            <Separator />

                            {/* 4. MOTIVO */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">4</div>
                                    <h3>Motivo de la consulta</h3>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Por favor describe los síntomas o el motivo de tu visita..."
                                                    className="min-h-[100px] resize-none text-base"
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
                                            <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Notas opcionales</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Alergias, comportamiento agresivo, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            {/* MOBILE ACTION BUTTON */}
                            <div className="lg:hidden">
                                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                    {loading ? "Confirmando..." : "Confirmar Cita"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* RIGHT COLUMN: LIVE TICKET PREVIEW */}
                <div className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-8 space-y-6">
                        <Card className="border-2 border-dashed shadow-lg overflow-hidden bg-muted/20">
                            <div className="bg-primary px-6 py-4">
                                <h2 className="text-primary-foreground font-bold text-lg flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Resumen de Cita
                                </h2>
                            </div>
                            <CardContent className="p-6 space-y-6 bg-background">
                                {/* Paciente */}
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border">
                                        {selectedPet ? getPetIcon(selectedPet.species) : <Sparkles className="text-muted-foreground" />}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Paciente</p>
                                        <p className="font-semibold text-lg">{selectedPet?.name || "Selecciona mascota"}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Detalles */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4" /> Especialista
                                        </div>
                                        <p className="font-medium text-sm text-right">{selectedVet ? `Dr. ${selectedVet.fullName.split(' ')[0]}` : "Pendiente"}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Tipo
                                        </div>
                                        {selectedTypeConfig ? (
                                            <Badge variant="outline" className={cn("text-xs", selectedTypeConfig.color.split(' ')[2])}>
                                                {selectedTypeConfig.label}
                                            </Badge>
                                        ) : <span>-</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Fecha
                                        </div>
                                        <p className="font-medium text-sm">
                                            {watchAllFields.scheduledDate 
                                                ? format(new Date(watchAllFields.scheduledDate), "d MMM, HH:mm", { locale: es }) 
                                                : "-"}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Duración
                                        </div>
                                        <p className="font-medium text-sm">{watchAllFields.durationMinutes} min</p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-600/10 to-blue-700/10 dark:from-blue-700/20 dark:to-blue-800/20 border border-blue-600/20 dark:border-blue-700/30 p-3 rounded-lg flex gap-3 items-start text-xs text-blue-700 dark:text-blue-300">
                                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>Por favor llega 10 minutos antes. La cancelación es gratuita hasta 24h antes.</p>
                                </div>
                            </CardContent>
                            <div className="p-4 bg-muted/50 border-t border-dashed">
                                <Button 
                                    size="lg" 
                                    className="w-full shadow-lg" 
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Check className="w-4 h-4 mr-2" />
                                    )}
                                    Confirmar Reserva
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Componentes Auxiliares ---

function LoadingScreen() {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Preparando formulario...</p>
        </div>
    );
}