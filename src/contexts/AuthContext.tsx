import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { useToast } from '../hooks/use-toast';

export type UserRole = 'admin' | 'veterinarian' | 'receptionist' | 'owner';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  roles?: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('vetclinic_user');
      const token = authService.getToken();

      if (storedUser && token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('vetclinic_user');
          localStorage.removeItem('vetclinic_token');
          localStorage.removeItem('vetclinic_refresh_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ username, password });

      if (response.success && response.data) {
        authService.setTokens(response.data.token, response.data.refreshToken);

        const roles = response.data.roles || [];
        let primaryRole: UserRole = 'receptionist';

        if (roles.some((r: string) => r === 'OWNER' || r === 'ROLE_OWNER')) {
          primaryRole = 'owner';
        } else if (roles.some((r: string) => r === 'ADMIN' || r === 'ROLE_ADMIN')) {
          primaryRole = 'admin';
        } else if (roles.some((r: string) => r === 'VETERINARIAN' || r === 'ROLE_VETERINARIAN')) {
          primaryRole = 'veterinarian';
        } else if (roles.some((r: string) => r === 'RECEPTIONIST' || r === 'ROLE_RECEPTIONIST')) {
          primaryRole = 'receptionist';
        }

        const userData: User = {
          id: response.data.username,
          username: response.data.username,
          email: response.data.email,
          fullName: response.data.fullName,
          role: primaryRole,
          roles: response.data.roles,
          permissions: response.data.permissions,
        };

        setUser(userData);
        localStorage.setItem('vetclinic_user', JSON.stringify(userData));

        toast({
          title: 'Login successful',
          description: `Welcome back, ${response.data.fullName}!`,
        });

        return true;
      }

      toast({
        title: 'Login failed',
        description: response.message || 'Invalid credentials',
        variant: 'destructive',
      });
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login error',
        description: error.response?.data?.message || 'Unable to connect to server',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}