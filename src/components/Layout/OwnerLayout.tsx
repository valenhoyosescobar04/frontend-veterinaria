import { Calendar, Dog, Briefcase, LogOut, PawPrint, Menu, X, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigation = [
    { name: 'Mis Citas', href: '/owner/appointments', icon: Calendar, description: 'Ver y gestionar citas' },
    { name: 'Reservar Cita', href: '/owner/book-appointment', icon: Calendar, description: 'Agendar nueva cita' },
    { name: 'Mis Mascotas', href: '/owner/pets', icon: Dog, description: 'Información de mascotas' },
    { name: 'Servicios', href: '/owner/services', icon: Briefcase, description: 'Servicios disponibles' },
];

export function OwnerLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-72 transform bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-20 items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 px-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="VetClinic Logo" className="h-12 w-12" />
                            <div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    Portal Cliente
                                </h1>
                                <p className="text-xs text-muted-foreground">VetClinic Pro</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            'h-5 w-5 transition-transform group-hover:scale-110',
                                            isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                                        )}
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold">{item.name}</div>
                                        <div
                                            className={cn(
                                                'text-xs',
                                                isActive
                                                    ? 'text-blue-100'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            {item.description}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="absolute right-2 h-2 w-2 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-4">
                        <div className="mb-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                                        {getInitials(user?.fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                        {user?.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    <div className="mt-1">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-2 py-0.5 text-xs font-medium text-white">
                                            <User className="h-3 w-3" />
                                            Cliente
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-72">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {navigation.find(nav => nav.href === location.pathname)?.name || 'Portal Cliente'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs">
                                                {getInitials(user?.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
