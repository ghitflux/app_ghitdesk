'use client';

import React from 'react';
import { KanbanBoard, TicketCard, type KanbanColumn, type KanbanItem } from '@ghit/ui';
import { useTickets, useTicketMutations } from '@/hooks/useTickets';
import type { Ticket } from '@/services/api/repositories/TicketRepository';

interface TicketKanbanItem extends KanbanItem {
  id: string;
  columnId: string;
  data: Ticket;
}

export default function TicketsPage() {
  const { tickets, isLoading } = useTickets();
  const { moveTicket } = useTicketMutations();

  const columns: KanbanColumn[] = [
    { id: 'open', title: 'Aberto', color: 'primary' },
    { id: 'in_progress', title: 'Em Andamento', color: 'info' },
    { id: 'pending', title: 'Aguardando', color: 'warning' },
    { id: 'resolved', title: 'Resolvido', color: 'success' },
  ];

  // Converter tickets para KanbanItems
  const kanbanItems: TicketKanbanItem[] = tickets.map((ticket) => ({
    id: ticket.id,
    columnId: ticket.status,
    data: ticket,
  }));

  const handleMove = (itemId: string, fromColumn: string, toColumn: string) => {
    moveTicket(itemId, fromColumn, toColumn);
  };

  const getSLAStatus = (ticket: Ticket): 'ok' | 'warning' | 'critical' | undefined => {
    if (!ticket.slaDueAt) return undefined;
    const now = new Date();
    const due = new Date(ticket.slaDueAt);
    const diff = due.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 0) return 'critical';
    if (hours < 2) return 'warning';
    return 'ok';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-muted">Carregando tickets...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">Tickets</h1>
        <p className="text-text-muted mt-1">Gerenciamento de tickets em Kanban</p>
      </div>

      <KanbanBoard
        columns={columns}
        items={kanbanItems}
        onMove={handleMove}
        renderItem={(item: TicketKanbanItem) => (
          <TicketCard
            id={item.data.id}
            title={item.data.title}
            description={item.data.description}
            status={item.data.status}
            priority={item.data.priority}
            slaStatus={getSLAStatus(item.data)}
            tags={item.data.tags}
            createdAt={item.data.createdAt}
            isDraggable
          />
        )}
      />
    </div>
  );
}
