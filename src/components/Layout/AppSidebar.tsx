import { Home, Users, Calendar, FileText, Package, BarChart3, Settings, LogOut, PawPrint, UserCircle, Pill, Briefcase, ClipboardCheck, CalendarDays, X, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, type User } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'veterinarian', 'receptionist'] },
  { name: 'Pacientes', href: '/patients', icon: PawPrint, roles: ['admin', 'veterinarian', 'receptionist'] },
  { name: 'Propietarios', href: '/owners', icon: Users, roles: ['admin', 'veterinarian', 'receptionist'] },
  { name: 'Citas', href: '/appointments', icon: Calendar, roles: ['admin', 'veterinarian', 'receptionist'] },
  { name: 'Agenda', href: '/agenda', icon: CalendarDays, roles: ['admin', 'veterinarian', 'receptionist'] },
  { name: 'Historias Clínicas', href: '/medical-records', icon: FileText, roles: ['admin', 'veterinarian'] },
  { name: 'Prescripciones', href: '/prescriptions', icon: Pill, roles: ['admin', 'veterinarian'] },
  { name: 'Consentimientos', href: '/informed-consents', icon: ClipboardCheck, roles: ['admin', 'veterinarian'] },
  { name: 'Inventario', href: '/inventory', icon: Package, roles: ['admin', 'veterinarian'] },
  { name: 'Servicios', href: '/services', icon: Briefcase, roles: ['admin', 'veterinarian', 'receptionist'] },
  { name: 'Reportes', href: '/reports', icon: BarChart3, roles: ['admin'] },
  { name: 'Usuarios', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['admin'] },
];

// Función para cargar usuario del localStorage de forma síncrona
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('vetclinic_user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading stored user:', error);
  }
  return null;
};

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();
  // Cargar usuario del localStorage de forma síncrona en el estado inicial
  const [storedUser] = useState<User | null>(() => getStoredUser());

  // Actualizar storedUser cuando el user del contexto cambie
  useEffect(() => {
    if (user) {
      // El usuario del contexto tiene prioridad, no necesitamos actualizar storedUser
    }
  }, [user]);

  // Usar el usuario del contexto si está disponible, sino usar el del localStorage
  const currentUser = user || storedUser;

  const filteredNavigation = navigation.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  // Si no hay items filtrados pero hay un usuario, mostrar items básicos como fallback
  const displayNavigation = filteredNavigation.length > 0 
    ? filteredNavigation 
    : (currentUser ? navigation.filter(item => item.roles.includes('admin') || item.roles.includes('receptionist')) : []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
              <img src="/logo.png" alt="VetClinic Logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">VetClinic</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {displayNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-sidebar-foreground sidebar-item-hover'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
          <p className="text-sm font-medium text-sidebar-foreground">{currentUser?.fullName || 'Cargando...'}</p>
          <p className="text-xs text-muted-foreground">{currentUser?.email || ''}</p>
          <p className="mt-1 text-xs font-medium text-primary capitalize">{currentUser?.role || ''}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
      </aside>
    </>
  );
}
