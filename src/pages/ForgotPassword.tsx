import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Mail } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setEmailSent(true);
      toast.success('Email de recuperación enviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error al enviar email de recuperación';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Mail className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Email Enviado</CardTitle>
              <CardDescription>
                Revisa tu bandeja de entrada para restablecer tu contraseña
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Volver al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <img src="/logo.png" alt="VetClinic Logo" className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
            <CardDescription>Ingresa tu email para recibir un enlace de recuperación</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Email de Recuperación'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Volver al Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

