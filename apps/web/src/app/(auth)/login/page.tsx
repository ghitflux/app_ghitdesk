'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">GhitDesk</h1>
          <p className="text-sm text-default-500">Login no sistema</p>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail size={18} className="text-default-400" />}
              isRequired
              autoComplete="email"
            />
            <Input
              type="password"
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock size={18} className="text-default-400" />}
              isRequired
              autoComplete="current-password"
            />
            {error && (
              <div className="p-3 bg-danger/10 border border-danger rounded-lg">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Entrar
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
