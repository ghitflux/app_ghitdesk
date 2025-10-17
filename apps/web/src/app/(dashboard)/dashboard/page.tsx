'use client';

import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500 mt-1">Bem-vindo ao GhitDesk!</p>
        </div>
        <Button
          color="danger"
          variant="flat"
          startContent={<LogOut size={18} />}
          onPress={handleLogout}
        >
          Sair
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Informações do Usuário</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-2">
          <p><strong>Nome:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">ETAPA 3 Completa! 🎉</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-default-600 mb-4">
            Backend FastAPI + Auth JWT + PostgreSQL está funcionando!
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-default-500">
            <li>✅ FastAPI com padrões Singleton (Config, DB, Redis)</li>
            <li>✅ SQLAlchemy User model</li>
            <li>✅ Repository Pattern</li>
            <li>✅ Auth JWT (login, logout)</li>
            <li>✅ BFF Route Handlers no Next.js</li>
            <li>✅ AuthContext e middleware</li>
            <li>✅ Página de login funcional</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
