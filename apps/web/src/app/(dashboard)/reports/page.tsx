'use client';

import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { MessageCircle, Ticket, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  // Mock data para MVP
  const metrics = {
    totalConversations: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: 0,
    slaCompliance: 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-default-500 mt-1">Métricas e análises do sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <MessageCircle size={24} className="text-primary" />
              <span className="text-2xl font-bold">{metrics.totalConversations}</span>
            </div>
            <p className="text-sm text-default-500">Total Conversas</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <Ticket size={24} className="text-warning" />
              <span className="text-2xl font-bold">{metrics.totalTickets}</span>
            </div>
            <p className="text-sm text-default-500">Total Tickets</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <AlertCircle size={24} className="text-danger" />
              <span className="text-2xl font-bold">{metrics.openTickets}</span>
            </div>
            <p className="text-sm text-default-500">Tickets Abertos</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <CheckCircle size={24} className="text-success" />
              <span className="text-2xl font-bold">{metrics.resolvedTickets}</span>
            </div>
            <p className="text-sm text-default-500">Tickets Resolvidos</p>
          </CardBody>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock size={20} />
              Tempo Médio de Resposta
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-3xl font-bold text-primary">
              {metrics.avgResponseTime}min
            </p>
            <p className="text-sm text-default-500 mt-2">
              Baseado nas últimas 24 horas
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp size={20} />
              SLA Compliance
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-3xl font-bold text-success">
              {metrics.slaCompliance}%
            </p>
            <p className="text-sm text-default-500 mt-2">
              Tickets resolvidos dentro do prazo
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">ETAPA 4 MVP Completa! 🎉</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-default-600 mb-4">
            Backend completo com padrões de design profissionais:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-default-500">
            <li>✅ Factory Pattern: ChannelFactory (WhatsApp, Email, Telegram)</li>
            <li>✅ Strategy Pattern: SLA Calculation (Simple + BusinessHours)</li>
            <li>✅ Strategy Pattern: Message Processing (WhatsApp + Email)</li>
            <li>✅ Singleton: WhatsApp Client, SSE Manager, Redis</li>
            <li>✅ Models completos: Contact, Conversation, Message, Ticket</li>
            <li>✅ Endpoints: /conversations, /tickets, /events/stream, /webhooks</li>
            <li>✅ SSE real-time implementado</li>
            <li>✅ Frontend: Inbox, Tickets, Reports pages</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
