import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
    PawPrint, 
    User, 
    Lock, 
    Loader2, 
    ArrowRight, 
    CheckCircle2, 
    Star,
    ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const success = await login(username, password);

      if (success) {
        // Lógica de redirección original intacta
        const userData = JSON.parse(localStorage.getItem('vetclinic_user') || '{}');
        const roles = userData.roles || [];

        toast.success(`Bienvenido de nuevo, ${userData.name || 'Usuario'}`);

        // Pequeño delay para que se vea la animación de éxito
        setTimeout(() => {
            if (roles.includes('OWNER') || roles.includes('ROLE_OWNER')) {
              navigate('/owner/appointments');
            } else if (roles.includes('ADMIN') || roles.includes('VETERINARIAN') || roles.includes('RECEPTIONIST') ||
                roles.includes('ROLE_ADMIN') || roles.includes('ROLE_VETERINARIAN') || roles.includes('ROLE_RECEPTIONIST')) {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
        }, 800);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Credenciales incorrectas');
      setLoading(false);
    } finally {
      // El loading se maneja en el catch y en el success
      // Solo se resetea aquí si no se hizo antes
      if (loading) {
        setLoading(false);
      }
    }
  };

  // Variantes de animación para aparición en cascada
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        
        {/* --- LEFT SIDE: FORMULARIO INTERACTIVO --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div 
                className="w-full max-w-md space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Back Button */}
                <motion.div variants={itemVariants}>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-4 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al inicio
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div variants={itemVariants} className="text-center lg:text-left space-y-2">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                        <img 
                            src="/logo.png" 
                            alt="VetClinic Logo" 
                            className="h-10 w-10 object-contain" 
                            onError={(e) => {
                                console.error('Error loading logo:', e);
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <span className="font-bold text-xl tracking-tight">VetClinic<span className="text-indigo-600">Pro</span></span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de nuevo</h1>
                    <p className="text-muted-foreground">Ingresa tus credenciales para acceder al panel de control.</p>
                </motion.div>

                {/* Form */}
                <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="space-y-2">
                        <Label htmlFor="username" className={focusedField === 'username' ? 'text-indigo-600' : ''}>Usuario</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-2.5 text-muted-foreground group-hover:text-indigo-600 transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <Input
                                id="username"
                                type="text"
                                placeholder="ej. doctor.smith"
                                className="pl-10 h-11 border-muted-foreground/20 focus:border-indigo-500 transition-all bg-background/50 backdrop-blur-sm"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className={focusedField === 'password' ? 'text-indigo-600' : ''}>Contraseña</Label>
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-3 top-2.5 text-muted-foreground group-hover:text-indigo-600 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 h-11 border-muted-foreground/20 focus:border-indigo-500 transition-all bg-background/50 backdrop-blur-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] text-base font-medium" 
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verificando...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                Iniciar Sesión <ArrowRight className="h-4 w-4" />
                            </div>
                        )}
                    </Button>
                </motion.form>

                {/* Footer */}
                <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
                    ¿No tienes una cuenta? <a href="#" className="text-indigo-600 font-semibold hover:underline">Contacta al administrador</a>
                </motion.p>
            </motion.div>
        </div>

        {/* --- RIGHT SIDE: VISUAL CINEMÁTICO --- */}
        <div className="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden">
            {/* Video */}
            <motion.div 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/90 to-purple-900/40 mix-blend-multiply z-10" />
                <video 
                    src="/Video_Generation_Confirmation.mp4" 
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Floating Glass Card - Testimonial/Stats */}
            <div className="absolute bottom-0 left-0 w-full p-12 z-20">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-xl shadow-2xl"
                >
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <blockquote className="text-xl text-white font-medium leading-relaxed mb-6">
                        "VetClinic Pro ha transformado completamente cómo gestionamos nuestros pacientes. La eficiencia nunca se sintió tan bien."
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-2 border-white/30 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" />
                        </div>
                        <div>
                            <p className="text-white font-bold">Dra. Sarah Jenkins</p>
                            <p className="text-indigo-200 text-sm">Directora Médica, PetCare Center</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Floating Orbs for atmosphere */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px] animate-pulse z-0" />
        </div>

      </div>
  );
}