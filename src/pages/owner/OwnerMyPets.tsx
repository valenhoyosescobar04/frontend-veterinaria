import { useState, useEffect } from 'react';
import { 
    Dog, 
    Calendar, 
    Weight, 
    Ruler, 
    Hash, 
    Heart,
    Loader2,
    Activity,
    PawPrint,
    Sparkles,
    Dna,
    Stethoscope,
    MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ownerPortalService } from '@/services/ownerPortalService';
import type { Patient } from '@/types/patient';
import { toast } from 'sonner';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils'; // Asumiendo que tienes esta utilidad standard de shadcn

// Configuración de diseño por especie (Colores más modernos y gradientes)
const speciesConfig: Record<string, { icon: string; color: string; bgGradient: string; shadow: string }> = {
    dog: { 
        icon: '🐕', 
        color: 'text-amber-600', 
        bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
        shadow: 'shadow-amber-500/10'
    },
    cat: { 
        icon: '🐱', 
        color: 'text-indigo-600', 
        bgGradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
        shadow: 'shadow-indigo-500/10'
    },
    bird: { 
        icon: '🦜', 
        color: 'text-sky-600', 
        bgGradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
        shadow: 'shadow-sky-500/10'
    },
    rabbit: { 
        icon: '🐰', 
        color: 'text-pink-600', 
        bgGradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
        shadow: 'shadow-pink-500/10'
    },
    other: { 
        icon: '🐾', 
        color: 'text-emerald-600', 
        bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        shadow: 'shadow-emerald-500/10'
    },
};

const sexConfig: Record<string, { label: string; icon: string }> = {
    male: { label: 'Macho', icon: '♂' },
    female: { label: 'Hembra', icon: '♀' },
};

export default function OwnerMyPets() {
    const [pets, setPets] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPets();
    }, []);

    const loadPets = async () => {
        try {
            setLoading(true);
            const data = await ownerPortalService.getMyPets();
            setPets(data);
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
            toast.error('No se pudieron cargar tus mascotas');
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return null;
        const birthDate = new Date(dateOfBirth);
        const years = differenceInYears(new Date(), birthDate);
        const months = differenceInMonths(new Date(), birthDate) % 12;
        
        if (years > 0) return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? `, ${months} m` : ''}`;
        return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-700/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-muted-foreground animate-pulse font-medium">Sincronizando expedientes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Mis Mascotas
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Gestiona el perfil y salud de tus compañeros.
                    </p>
                </div>
                
                {/* Quick Stats Mini-Dashboard */}
                <div className="flex gap-3">
                    <div className="bg-background border rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg text-white">
                            <PawPrint size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase">Total</p>
                            <p className="text-xl font-bold leading-none">{pets.length}</p>
                        </div>
                    </div>
                    <div className="bg-background border rounded-xl px-4 py-2 shadow-sm flex items-center gap-3 hidden sm:flex">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                            <Activity size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase">Activos</p>
                            <p className="text-xl font-bold leading-none">{pets.filter(p => p.isActive).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pets Grid */}
            {pets.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {pets.map((pet) => {
                        const config = speciesConfig[pet.species.toLowerCase()] || speciesConfig.other;
                        const age = calculateAge(pet.dateOfBirth);
                        
                        return (
                            <Card 
                                key={pet.id} 
                                className={cn(
                                    "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted/60",
                                    config.shadow
                                )}
                            >
                                {/* Decorative Header Gradient */}
                                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${config.bgGradient} opacity-50`} />
                                
                                <CardContent className="relative pt-6">
                                    {/* Top Section: Avatar & Status */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border p-1 flex items-center justify-center text-4xl relative z-10 group-hover:scale-105 transition-transform duration-300">
                                                {config.icon}
                                            </div>
                                            {/* Status Dot */}
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white dark:border-zinc-900 rounded-full z-20",
                                                pet.isActive ? "bg-emerald-500" : "bg-slate-300"
                                            )} title={pet.isActive ? "Activo" : "Inactivo"} />
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreHorizontal size={18} />
                                            </Button>
                                            <Badge variant="secondary" className="font-mono text-xs tracking-wider opacity-70">
                                                ID: {pet.id.toString().padStart(4, '0')}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Main Info */}
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {pet.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                            <span className="font-medium text-foreground/80">{pet.breed}</span>
                                            <span>•</span>
                                            <span className="capitalize">{pet.species}</span>
                                            {pet.sex && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-foreground/80 font-medium" title={sexLabels[pet.sex] || pet.sex}>
                                                        {sexConfig[pet.sex]?.icon || pet.sex}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <InfoItem 
                                            icon={<Calendar size={14} />} 
                                            label="Edad" 
                                            value={age || "N/A"} 
                                        />
                                        <InfoItem 
                                            icon={<Weight size={14} />} 
                                            label="Peso" 
                                            value={pet.weight ? `${pet.weight} kg` : "--"} 
                                        />
                                        <InfoItem 
                                            icon={<Dna size={14} />} 
                                            label="Color" 
                                            value={pet.color || "--"} 
                                            className="capitalize"
                                        />
                                        <InfoItem 
                                            icon={<Hash size={14} />} 
                                            label="Microchip" 
                                            value={pet.microchip || "No registrado"} 
                                            isMono
                                        />
                                    </div>

                                    {/* Footer / Actions */}
                                    <div className="pt-4 border-t border-dashed flex items-center justify-between">
                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Stethoscope size={14} />
                                            <span>Última visita: <span className="text-foreground font-medium">Hace 2 meses</span></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- Subcomponentes para limpieza de código ---

function InfoItem({ icon, label, value, className, isMono }: { icon: React.ReactNode, label: string, value: string, className?: string, isMono?: boolean }) {
    return (
        <div className="bg-secondary/30 rounded-lg p-2.5 flex flex-col gap-1 transition-colors hover:bg-secondary/50">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                {icon}
                <span>{label}</span>
            </div>
            <span className={cn(
                "text-sm font-semibold truncate text-foreground/90", 
                isMono && "font-mono tracking-tight text-xs",
                className
            )}>
                {value}
            </span>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-muted-foreground/20 rounded-3xl bg-muted/5">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-full shadow-lg mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-700/10 rounded-full animate-ping duration-1000" />
                <Dog size={48} className="text-muted-foreground relative z-10" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">No hay mascotas registradas</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8">
                Parece que aún no tienes mascotas vinculadas a tu cuenta. Contacta con la clínica para darlas de alta.
            </p>
            <Button variant="outline" className="gap-2">
                <Stethoscope size={16} />
                Contactar Clínica
            </Button>
        </div>
    );
}

const sexLabels: Record<string, string> = {
    male: 'Macho',
    female: 'Hembra',
};