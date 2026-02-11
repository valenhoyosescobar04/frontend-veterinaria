import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { ownerService } from '@/services/ownerService';
import type { Owner } from '@/types/owner';

const formSchema = z.object({
    documentType: z.enum(['CC', 'CE', 'TI', 'PAS']),
    documentNumber: z.string().min(5, 'Documento debe tener al menos 5 caracteres'),
    firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(7, 'Teléfono debe tener al menos 7 caracteres'),
    address: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
    city: z.string().min(2, 'Ciudad debe tener al menos 2 caracteres'),
    notes: z.string().optional(),
    username: z.string().min(4, 'Usuario debe tener al menos 4 caracteres').regex(/^\w+$/, 'Solo letras, números y guiones bajos'),
    password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

interface OwnerFormDialogProps {
    owner?: Owner;
    children?: React.ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function OwnerFormDialog({ owner, children, onSuccess, open: controlledOpen, onOpenChange: controlledOnOpenChange }: Readonly<OwnerFormDialogProps>) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Usar el estado controlado si está disponible, de lo contrario usar el estado interno
    const open = controlledOpen ?? internalOpen;
    const setOpen = controlledOnOpenChange ?? setInternalOpen;

    // Determinar el texto del botón
    const getButtonText = () => {
        if (loading) return 'Guardando...';
        return owner ? 'Actualizar' : 'Crear';
    };

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: owner || {
            documentType: 'CC',
            documentNumber: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            notes: '',
            username: '',
            password: '',
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);

            if (owner) {
                await ownerService.update(owner.id, data);
                toast({
                    title: 'Propietario actualizado',
                    description: `${data.firstName} ${data.lastName} ha sido actualizado exitosamente.`,
                });
            } else {
                await ownerService.create(data as Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>);
                toast({
                    title: 'Propietario creado',
                    description: `${data.firstName} ${data.lastName} ha sido registrado exitosamente.`,
                });
            }

            setOpen(false);
            form.reset();
            onSuccess?.();
        } catch (error: any) {
            console.error('Error al guardar propietario:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo guardar el propietario',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                        {owner ? 'Editar Propietario' : 'Nuevo Propietario'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {owner ? 'Actualiza la información del propietario' : 'Registra un nuevo propietario en el sistema'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="documentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Documento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                                <SelectItem value="PAS">Pasaporte</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="documentNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Documento</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Juan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="juan@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+57 300 123 4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Calle 123 #45-67" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bogotá" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!owner && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de Usuario</FormLabel>
                                            <FormControl>
                                                <Input placeholder="juanperez" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Adicionales</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Observaciones o información adicional..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {getButtonText()} Propietario
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}