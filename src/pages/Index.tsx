import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    PawPrint, ArrowRight, CheckCircle2, BarChart3, 
    Stethoscope, Zap, CalendarCheck, Users, Activity,
    MousePointer2, Search, Bell, Check
} from 'lucide-react';
import { 
    motion, 
    useScroll, 
    useTransform, 
    useInView, 
    animate 
} from 'framer-motion';
import { cn } from '@/lib/utils';

// --- MAIN COMPONENT ---

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard');
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, isLoading, navigate]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      <Navbar scrolled={scrolled} navigate={navigate} />
      <main>
        <HeroSection navigate={navigate} />
        <StatsSection />
        <FeaturesSection />
        <CTASection navigate={navigate} />
      </main>
      <Footer />
    </div>
  );
};

// --- HELPER: COUNT UP ANIMATION ---
const CountUp = ({ to, suffix = "", prefix = "" }: { to: number, suffix?: string, prefix?: string }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: true, margin: "-100px" });
    
    useEffect(() => {
        if (!inView) return;
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, to, {
            duration: 2.5,
            ease: "easeOut",
            onUpdate(value) {
                let formattedValue = "";
                if (to % 1 !== 0) formattedValue = value.toFixed(1);
                else formattedValue = Math.round(value).toLocaleString('en-US');
                node.textContent = `${prefix}${formattedValue}${suffix}`;
            }
        });
        return () => controls.stop();
    }, [to, inView, suffix, prefix]);

    return <span ref={nodeRef} className="tabular-nums" />;
};

// --- 1. HERO SECTION (CENTRADA + 3D) ---
const HeroSection = ({ navigate }: { navigate: any }) => {
    const { scrollY } = useScroll();
    
    // Animaciones de fondo
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    
    // Efecto 3D Dashboard
    const rotateX = useTransform(scrollY, [0, 400], [20, 0]); 
    const scale = useTransform(scrollY, [0, 400], [0.9, 1]);
    const opacity = useTransform(scrollY, [0, 200], [1, 1]);

    return (
        <section className="relative pt-32 pb-32 lg:pt-48 overflow-hidden min-h-screen flex flex-col items-center">
            {/* Background Orbs */}
            <motion.div style={{ y: y1 }} className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 opacity-60" />
            <motion.div style={{ y: y2 }} className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -z-10 opacity-60" />
            
            <div className="container mx-auto px-4 text-center z-10 flex flex-col items-center">
                
                {/* Text Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <Badge variant="outline" className="mb-8 px-4 py-1.5 text-sm border-indigo-200 bg-white/50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800 backdrop-blur-md shadow-sm">
                        ✨ Innovación Veterinaria 2025
                    </Badge>
                    
                    <motion.h1 
                        className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] text-center"
                    >
                        <motion.span
                            className="block"
                            initial={{ opacity: 0, y: -30, rotateX: -90 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ 
                                duration: 0.8, 
                                delay: 0.2, 
                                ease: [0.16, 1, 0.3, 1]
                            }}
                        >
                            El Futuro de tu
                        </motion.span>
                        <motion.span 
                            className="block mt-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent"
                            initial={{ opacity: 0, scale: 0.5, y: 50, rotateY: 90 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                            transition={{ 
                                duration: 1.2, 
                                delay: 0.5, 
                                ease: [0.16, 1, 0.3, 1],
                                type: "spring",
                                stiffness: 80,
                                damping: 15
                            }}
                        >
                            Clinica Veterinaria
                        </motion.span>
                    </motion.h1>
                    
                    <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-12 leading-relaxed text-center">
                        La plataforma integral que transforma tu clínica. Pacientes, citas e inventario en perfecta sincronía.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 w-full">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 hover:scale-105 transition-transform w-full sm:w-auto" onClick={() => navigate('/login')}>
                            <Zap className="mr-2 h-5 w-5 fill-current" /> Acceder al Sistema
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-2 bg-background/50 backdrop-blur hover:bg-muted/50 w-full sm:w-auto" onClick={() => navigate('/login')}>
                            Explorar Funcionalidades
                        </Button>
                    </div>
                </motion.div>

                {/* 3D Dashboard Mockup - PERFECTAMENTE CENTRADO */}
                <div className="w-full max-w-6xl mx-auto perspective-container h-[500px] md:h-[700px] relative">
                    <motion.div 
                        style={{ rotateX, scale, opacity }}
                        className="w-full h-full"
                    >
                        <div className="relative w-full h-full rounded-2xl border border-white/20 bg-background/60 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] overflow-hidden ring-1 ring-white/10">
                            
                            {/* Browser Header */}
                            <div className="h-12 border-b border-white/10 bg-muted/40 flex items-center px-6 gap-4 sticky top-0 z-20 backdrop-blur-md">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm" />
                                </div>
                                <div className="flex-1 max-w-2xl h-8 bg-white/5 rounded-lg mx-auto border border-white/5 flex items-center justify-center text-xs text-muted-foreground font-mono">
                                    vetclinic-pro.app/dashboard
                                </div>
                            </div>
                            
                            {/* Dashboard UI Mockup */}
                            <div className="p-8 grid grid-cols-12 gap-6 h-full bg-gradient-to-b from-background/50 to-indigo-950/5">
                                {/* Sidebar Fake */}
                                <div className="col-span-2 hidden lg:flex flex-col gap-4 pr-4 border-r border-dashed border-indigo-200/20">
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className="h-10 w-full rounded-lg bg-indigo-500/5 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                    ))}
                                </div>
                                
                                {/* Main Area */}
                                <div className="col-span-12 lg:col-span-10 grid grid-cols-3 gap-6">
                                    <div className="col-span-3 lg:col-span-2 h-48 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white flex justify-between items-center shadow-lg relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                        <div className="relative z-10 space-y-4">
                                            <div className="h-8 w-48 bg-white/20 rounded-lg backdrop-blur-sm" />
                                            <div className="h-12 w-32 bg-white/30 rounded-lg backdrop-blur-sm" />
                                        </div>
                                        <Activity className="h-32 w-32 text-white/10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform duration-500" />
                                    </div>

                                    <div className="col-span-3 lg:col-span-1 h-48 rounded-2xl border bg-card/40 p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-center">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <ArrowRight className="h-5 w-5 -rotate-45" />
                                            </div>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">+24%</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-20 bg-muted rounded" />
                                            <div className="h-8 w-32 bg-muted rounded" />
                                        </div>
                                    </div>

                                    <div className="col-span-3 h-64 rounded-2xl border bg-card/40 p-6 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:linear-gradient(0deg,white,transparent)] dark:[mask-image:linear-gradient(0deg,white,transparent)]" />
                                        <div className="flex items-end justify-between h-full gap-4 pb-4 px-4">
                                            {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${h}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: i * 0.1, ease: "backOut" }}
                                                    className="w-full bg-indigo-500/20 rounded-t-lg border-t border-x border-indigo-500/30 hover:bg-indigo-500/40 transition-colors"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Notification */}
                            <motion.div 
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-12 left-12 bg-white dark:bg-zinc-800 p-4 pr-8 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4 z-30 max-w-xs"
                            >
                                <div className="relative">
                                    <div className="bg-green-500 rounded-full p-3 text-white">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Actualización</p>
                                    <p className="font-bold text-sm text-foreground">Cita Confirmada</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <style>{`.perspective-container { perspective: 2000px; }`}</style>
        </section>
    );
};

// --- 2. STATS SECTION (CON COUNT UP) ---
const StatsSection = () => {
    return (
        <section className="py-24 bg-muted/20 border-y border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 divide-x divide-border/0 md:divide-border/40">
                    <StatItem to={15} suffix="+" label="Módulos Integrados" />
                    <StatItem to={100} suffix="%" label="Código Abierto" />
                    <StatItem to={2025} suffix="" label="Año de Desarrollo" />
                    <StatItem to={99} suffix="%" label="Cobertura de Tests" />
                </div>
            </div>
        </section>
    );
};

const StatItem = ({ to, suffix, label }: any) => (
    <div className="text-center group">
        <h3 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent mb-2">
            <CountUp to={to} suffix={suffix} />
        </h3>
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{label}</p>
    </div>
);

// --- 3. FEATURES SECTION (RESTAURADA: DISEÑO BENTO GRID) ---
const FeaturesSection = () => {
  return (
      <section className="py-32 container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 border-none">
                  Potencia Total
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Todo lo que necesitas. <br/><span className="text-muted-foreground">Y nada que no.</span></h2>
              <p className="text-xl text-muted-foreground">Hemos destilado años de experiencia veterinaria en una interfaz que se siente mágica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                  className="md:col-span-2"
                  icon={<CalendarCheck className="w-10 h-10 text-white" />}
                  title="Gestión Completa de Citas"
                  description="Sistema integral de citas con estados, agenda visual y notificaciones automáticas por email. Gestiona consultas, vacunaciones, cirugías y urgencias desde un solo lugar."
                  gradient="from-blue-500 to-cyan-500"
                  delay={0}
              />
              <FeatureCard 
                  icon={<Users className="w-10 h-10 text-white" />}
                  title="Portal de Clientes"
                  description="Fideliza a los dueños permitiéndoles ver sus mascotas, historial de vacunas y reservar citas desde su móvil de forma sencilla e intuitiva."
                  gradient="from-purple-500 to-pink-500"
                  delay={0.2}
              />
              <FeatureCard 
                  icon={<Stethoscope className="w-10 h-10 text-white" />}
                  title="Historias Clínicas Digitales"
                  description="Registra y gestiona el historial médico completo de cada paciente. Incluye prescripciones, consentimientos informados y seguimiento detallado de tratamientos."
                  gradient="from-orange-500 to-red-500"
                  delay={0.4}
              />
              <FeatureCard 
                  className="md:col-span-2"
                  icon={<BarChart3 className="w-10 h-10 text-white" />}
                  title="Reportes y Analíticas"
                  description="Visualiza ingresos, estadísticas de pacientes y rendimiento de servicios en tiempo real. Genera reportes de citas, pacientes y servicios con exportación a Excel."
                  gradient="from-emerald-500 to-teal-500"
                  delay={0.6}
              />
          </div>
      </section>
  );
};

const FeatureCard = ({ className, icon, title, description, gradient, delay }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
      <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay }}
          whileHover={{ y: -10 }}
          className={cn(
              "group relative overflow-hidden rounded-[2rem] border bg-background p-10 shadow-lg hover:shadow-2xl transition-all duration-300",
              className
          )}
      >
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity`} />
          
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-300`}>
              {icon}
          </div>
          
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>

          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transition-transform duration-300">
              <ArrowRight className="w-6 h-6 text-foreground/50" />
          </div>
      </motion.div>
  );
};


// --- 4. CTA SECTION (RESTAURADA: DISEÑO ABSTRACTO) ---
const CTASection = ({ navigate }: { navigate: any }) => (
    <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative rounded-[3rem] bg-indigo-950 px-6 py-24 text-center shadow-2xl overflow-hidden"
            >
                {/* Abstract Background Shapes (Restored) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        ¿Listo para transformar tu clínica?
                    </h2>
                    <p className="text-indigo-200 text-xl max-w-2xl mx-auto">
                        Sistema de gestión desarrollado como proyecto universitario para modernizar 
                        la administración de clínicas veterinarias con tecnología de vanguardia.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button 
                            size="lg" 
                            className="h-16 px-10 text-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
                            onClick={() => navigate('/login')}
                        >
                            Acceder al Sistema
                        </Button>
                    </div>
                    <p className="text-sm text-indigo-400/60 mt-8">Proyecto Universitario de Excelencia 2025</p>
                </div>
            </motion.div>
        </div>
    </section>
);

// --- COMPONENTES AUXILIARES ---

const Navbar = ({ scrolled, navigate }: { scrolled: boolean, navigate: any }) => (
    <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
            "fixed top-0 w-full z-50 transition-all duration-300",
            scrolled ? "bg-background/70 backdrop-blur-xl border-b shadow-sm py-3" : "bg-transparent py-6"
        )}
    >
        <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer">
                <img 
                    src="/logo.png" 
                    alt="VetClinic Logo" 
                    className="h-10 w-10 group-hover:rotate-12 transition-transform duration-300 object-contain" 
                    onError={(e) => {
                        console.error('Error loading logo:', e);
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
                <h1 className="text-xl font-bold tracking-tight">VetClinic<span className="text-indigo-600">Pro</span></h1>
            </div>
            
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="hidden sm:flex hover:bg-indigo-50 dark:hover:bg-indigo-950/50" onClick={() => navigate('/login')}>
                    Ingresar
                </Button>
                <Button 
                    onClick={() => navigate('/login')} 
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all scale-100 hover:scale-105 active:scale-95"
                >
                    Acceder <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    </motion.header>
);

const Footer = () => (
    <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <PawPrint className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">VetClinic Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Diseñado con pasión para la Universidad.</p>
            <div className="flex gap-6">
                {['Github', 'Twitter', 'LinkedIn'].map((item) => (
                    <a key={item} href="#" className="text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors">
                        {item}
                    </a>
                ))}
            </div>
        </div>
    </footer>
);

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-24 w-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl"
        >
            <PawPrint className="h-12 w-12 text-white" />
        </motion.div>
    </div>
);

export default Index;