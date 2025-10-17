'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Input, Select, SelectItem } from '@heroui/react';
import { Search, Ticket as TicketIcon } from 'lucide-react';
import { TicketCard } from '@/components/ghitdesk/ticket-card';
import { useSSE } from '@/hooks/useSSE';
import { apiClient } from '@/services/api-client';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  sla?: {
    hours_remaining: number;
    is_breached: boolean;
    is_warning: boolean;
  };
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { isConnected } = useSSE();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await apiClient.request<{ tickets: Ticket[] }>('/tickets');
        setTickets(data.tickets);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const formatSLA = (sla?: Ticket['sla']) => {
    if (!sla) return undefined;
    const hours = Math.floor(sla.hours_remaining);
    if (hours < 0) return 'SLA vencido';
    if (hours < 1) return `${Math.floor(sla.hours_remaining * 60)}min restantes`;
    return `${hours}h restantes`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-default-500 mt-1">
            Gerenciar tickets • {isConnected ? '🟢' : '🔴'} Real-time
          </p>
        </div>
        <Select
          label="Status"
          placeholder="Todos"
          className="w-48"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <SelectItem key="open" value="open">Aberto</SelectItem>
          <SelectItem key="in_progress" value="in_progress">Em Andamento</SelectItem>
          <SelectItem key="resolved" value="resolved">Resolvido</SelectItem>
        </Select>
      </div>

      <Input
        placeholder="Buscar tickets..."
        startContent={<Search size={18} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardBody>
              <p className="text-center text-default-500">Carregando...</p>
            </CardBody>
          </Card>
        ) : tickets.length === 0 ? (
          <Card>
            <CardBody className="text-center space-y-4 py-12">
              <TicketIcon size={48} className="mx-auto text-default-300" />
              <div>
                <p className="text-lg font-medium">Nenhum ticket encontrado</p>
                <p className="text-default-500 text-sm mt-1">
                  Os tickets aparecerão aqui quando forem criados
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                id={ticket.ticket_number}
                title={ticket.title}
                description="Descrição do ticket (mock)"
                status={ticket.status}
                priority={ticket.priority}
                channel="whatsapp"
                messageCount={0}
                slaRemaining={formatSLA(ticket.sla)}
                createdAt={new Date(ticket.created_at).toLocaleString('pt-BR')}
              />
            ))}
          </div>
        )}
      </div>

      {tickets.length > 0 && (
        <Card>
          <CardBody className="text-center text-sm text-default-500">
            Mostrando {tickets.length} tickets • ETAPA 4 MVP
          </CardBody>
        </Card>
      )}
    </div>
  );
}
