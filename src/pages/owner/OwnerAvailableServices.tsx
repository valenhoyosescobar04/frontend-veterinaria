import { useState, useEffect, useMemo } from 'react';
import { 
    Briefcase, 
    Search, 
    Clock, 
    DollarSign, 
    CalendarCheck,
    Stethoscope,
    Syringe,
    Scissors,
    Sparkles,
    FlaskConical,
    AlertCircle,
    Loader2,
    Filter,
    X,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ownerPortalService } from '@/services/ownerPortalService';
import type { ClinicService } from '@/services/clinicService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const categoryConfig: Record<string, { 
    label: string; 
    icon: React.ReactNode; 
    color: string;
    bgColor: string;
}> = {
    CONSULTATION: { 
        label: 'Consulta', 
        icon: <Stethoscope className="h-5 w-5" />,
        color: 'text-white dark:text-white',
        bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800'
    },
    VACCINATION: { 
        label: 'Vacunación', 
        icon: <Syringe className="h-5 w-5" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/50'
    },
    SURGERY: { 
        label: 'Cirugía', 
        icon: <Scissors className="h-5 w-5" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/50'
    },
    GROOMING: { 
        label: 'Estética', 
        icon: <Sparkles className="h-5 w-5" />,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950/50'
    },
    TREATMENT: { 
        label: 'Tratamiento', 
        icon: <FlaskConical className="h-5 w-5" />,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/50'
    },
    EMERGENCY: { 
        label: 'Emergencia', 
        icon: <AlertCircle className="h-5 w-5" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/50'
    },
    LABORATORY: { 
        label: 'Laboratorio', 
        icon: <FlaskConical className="h-5 w-5" />,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-950/50'
    },
};

export default function OwnerAvailableServices() {
    const [services, setServices] = useState<ClinicService[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const data = await ownerPortalService.getAvailableServices();
            setServices(data);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            toast.error('Error al cargar los servicios');
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(services.map(s => s.category)));
        return uniqueCategories.sort();
    }, [services]);

    const filteredServices = useMemo(() => {
        let filtered = services.filter(s => s.isActive);

        // Filtrar por búsqueda
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(service =>
                service.name?.toLowerCase().includes(search) ||
                service.description?.toLowerCase().includes(search) ||
                service.category?.toLowerCase().includes(search)
            );
        }

        // Filtrar por categoría
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(service => service.category === categoryFilter);
        }

        return filtered.sort((a, b) => {
            // Ordenar por categoría primero, luego por nombre
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }
            return a.name.localeCompare(b.name);
        });
    }, [services, searchTerm, categoryFilter]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: services.filter(s => s.isActive).length };
        categories.forEach(cat => {
            counts[cat] = services.filter(s => s.category === cat && s.isActive).length;
        });
        return counts;
    }, [services, categories]);

    const getCategoryInfo = (category: string) => {
        return categoryConfig[category] || {
            label: category,
            icon: <Briefcase className="h-5 w-5" />,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-50 dark:bg-gray-950/50'
        };
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Cargando servicios disponibles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Servicios Disponibles</h1>
                    <p className="text-muted-foreground mt-1">
                        Explora todos los servicios que ofrecemos para el cuidado de tu mascota
                    </p>
                </div>
                <Link to="/owner/book-appointment">
                    <Button className="w-full sm:w-auto">
                        <CalendarCheck className="h-4 w-4 mr-2" />
                        Agendar Cita
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Servicios</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categoryCounts.all}</div>
                        <p className="text-xs text-muted-foreground">Servicios activos disponibles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                        <p className="text-xs text-muted-foreground">Diferentes tipos de servicios</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resultados</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredServices.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {searchTerm || categoryFilter !== 'all' ? 'Servicios filtrados' : 'Todos los servicios'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar servicios por nombre, descripción o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => setSearchTerm('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Category Tabs */}
                <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto">
                        <TabsTrigger value="all" className="text-xs sm:text-sm">
                            Todos ({categoryCounts.all})
                        </TabsTrigger>
                        {categories.map((category) => {
                            const catInfo = getCategoryInfo(category);
                            return (
                                <TabsTrigger 
                                    key={category} 
                                    value={category}
                                    className="text-xs sm:text-sm"
                                >
                                    <span className="hidden sm:inline mr-1">{catInfo.icon}</span>
                                    {catInfo.label} ({categoryCounts[category] || 0})
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </Tabs>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No se encontraron servicios</h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                            {searchTerm 
                                ? `No hay servicios que coincidan con "${searchTerm}"`
                                : categoryFilter !== 'all'
                                ? `No hay servicios en la categoría seleccionada`
                                : 'No hay servicios disponibles en este momento'
                            }
                        </p>
                        {(searchTerm || categoryFilter !== 'all') && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('all');
                                }}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpiar filtros
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredServices.map((service) => {
                        const catInfo = getCategoryInfo(service.category);
                        return (
                            <Card 
                                key={service.id} 
                                className="transition-all hover:shadow-lg hover:scale-[1.02] group"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${catInfo.bgColor} mb-3`}>
                                            <div className={catInfo.color}>
                                                {catInfo.icon}
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={service.isActive ? 'default' : 'secondary'}
                                            className="flex items-center gap-1"
                                        >
                                            {service.isActive ? (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Disponible
                                                </>
                                            ) : (
                                                'No disponible'
                                            )}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl mb-1">{service.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <span className={catInfo.color}>
                                            {catInfo.icon}
                                        </span>
                                        {catInfo.label}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {service.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {service.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-2xl font-bold text-primary">
                                                    {formatPrice(service.price)}
                                                </span>
                                            </div>
                                            {service.durationMinutes && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{service.durationMinutes} min</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {service.requiresAppointment !== false && (
                                        <Link to="/owner/book-appointment" state={{ serviceId: service.id }}>
                                            <Button className="w-full group-hover:bg-primary/90">
                                                <CalendarCheck className="h-4 w-4 mr-2" />
                                                Agendar Cita
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
