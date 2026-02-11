import { useState } from 'react';
import { 
  Building2, Clock, Bell, Lock, Save, 
  MapPin, Phone, Mail, Globe, CheckCircle2, 
  ShieldCheck, AlertTriangle, Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State (Mock data for demo)
  const [clinicInfo, setClinicInfo] = useState({
    name: 'VetClinic Pro',
    address: 'Calle Principal 123, Ciudad',
    phone: '+57 300 123 4567',
    email: 'contacto@vetclinic.com',
    website: 'www.vetclinic.com'
  });

  const [schedule, setSchedule] = useState({
    open: '08:00',
    close: '18:00',
    duration: 30
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    reminders: true
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleSaveClinic = () => {
    toast({ title: 'Información actualizada', description: 'Los datos de la clínica se han guardado.' });
  };

  const handleSaveSchedule = () => {
    toast({ title: 'Horario actualizado', description: 'La configuración de agenda se ha guardado.' });
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      toast({ title: 'Contraseña actualizada', description: 'Tu seguridad ha sido reforzada.' });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Error al cambiar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administra las preferencias generales, seguridad y notificaciones.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <TabsList className="flex md:flex-col justify-start h-auto bg-transparent p-0 gap-2 min-w-[240px]">
            <TabsTrigger value="general" className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-lg">
                <Building2 className="mr-3 h-4 w-4" /> Información General
            </TabsTrigger>
            <TabsTrigger value="schedule" className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-lg">
                <Clock className="mr-3 h-4 w-4" /> Horarios y Agenda
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-lg">
                <Bell className="mr-3 h-4 w-4" /> Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-lg">
                <Lock className="mr-3 h-4 w-4" /> Seguridad
            </TabsTrigger>
        </TabsList>

        {/* CONTENT AREA */}
        <div className="flex-1">
            
            {/* GENERAL SETTINGS */}
            <TabsContent value="general" className="mt-0 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil de la Clínica</CardTitle>
                        <CardDescription>Esta información aparecerá en facturas y correos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre Comercial</Label>
                            <Input value={clinicInfo.name} onChange={e => setClinicInfo({...clinicInfo, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Dirección Física</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Textarea className="pl-9 min-h-[80px]" value={clinicInfo.address} onChange={e => setClinicInfo({...clinicInfo, address: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-9" value={clinicInfo.phone} onChange={e => setClinicInfo({...clinicInfo, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email de Contacto</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-9" value={clinicInfo.email} onChange={e => setClinicInfo({...clinicInfo, email: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSaveClinic}>Guardar Cambios</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* SCHEDULE SETTINGS */}
            <TabsContent value="schedule" className="mt-0 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración de Agenda</CardTitle>
                        <CardDescription>Define los límites para la reserva de citas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Hora de Apertura</Label>
                                <Input type="time" value={schedule.open} onChange={e => setSchedule({...schedule, open: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Hora de Cierre</Label>
                                <Input type="time" value={schedule.close} onChange={e => setSchedule({...schedule, close: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duración Estándar de Cita (minutos)</Label>
                            <Input type="number" value={schedule.duration} onChange={e => setSchedule({...schedule, duration: parseInt(e.target.value)})} />
                            <p className="text-xs text-muted-foreground">Esto definirá los bloques de tiempo en el calendario.</p>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSaveSchedule}>Actualizar Horario</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* NOTIFICATIONS SETTINGS */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Canales de Comunicación</CardTitle>
                        <CardDescription>Elige cómo quieres recibir las alertas del sistema.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setNotifications({...notifications, email: !notifications.email})}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Mail className="h-5 w-5" /></div>
                                <div>
                                    <p className="font-medium">Correos Electrónicos</p>
                                    <p className="text-sm text-muted-foreground">Recibe resúmenes diarios y alertas de seguridad.</p>
                                </div>
                            </div>
                            <Switch checked={notifications.email} />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setNotifications({...notifications, sms: !notifications.sms})}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600"><Smartphone className="h-5 w-5" /></div>
                                <div>
                                    <p className="font-medium">Mensajes SMS</p>
                                    <p className="text-sm text-muted-foreground">Alertas críticas directo a tu móvil.</p>
                                </div>
                            </div>
                            <Switch checked={notifications.sms} />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setNotifications({...notifications, reminders: !notifications.reminders})}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Clock className="h-5 w-5" /></div>
                                <div>
                                    <p className="font-medium">Recordatorios de Citas</p>
                                    <p className="text-sm text-muted-foreground">Notificar automáticamente a los clientes.</p>
                                </div>
                            </div>
                            <Switch checked={notifications.reminders} />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* SECURITY SETTINGS */}
            <TabsContent value="security" className="mt-0 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Cambio de Contraseña</CardTitle>
                        <CardDescription>Mantén tu cuenta segura actualizando tu clave periódicamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Contraseña Actual</Label>
                            <Input type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} />
                        </div>
                        <Separator />
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nueva Contraseña</Label>
                                <Input type="password" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirmar Nueva Contraseña</Label>
                                <Input type="password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={handlePasswordChange} disabled={loading} variant="destructive">
                                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-orange-800 text-sm">Zona de Peligro</h4>
                        <p className="text-xs text-orange-700 mt-1">
                            Si deseas eliminar tu cuenta o resetear la base de datos, por favor contacta al soporte técnico. Esta acción no se puede deshacer desde aquí.
                        </p>
                    </div>
                </div>
            </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}