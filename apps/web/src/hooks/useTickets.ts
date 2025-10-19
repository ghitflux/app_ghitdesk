import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ticketRepository, type Ticket, type CreateTicketInput, type UpdateTicketInput } from '@/services/api/repositories/TicketRepository';
import { RealtimeService } from '@/services/realtime/RealtimeService';

/**
 * Hook para gerenciar tickets com TanStack Query e realtime updates
 */
export function useTickets(filters?: any) {
  const queryClient = useQueryClient();
  const realtimeService = RealtimeService.getInstance();

  // Query para listar tickets
  const {
    data: tickets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketRepository.getAll(filters),
    staleTime: 1000 * 60, // 1 minute
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribeCreated = realtimeService.onTicketCreated((newTicket) => {
      queryClient.setQueryData(['tickets', filters], (old: Ticket[] = []) => {
        return [newTicket, ...old];
      });
    });

    const unsubscribeUpdated = realtimeService.onTicketUpdated((updatedTicket) => {
      queryClient.setQueryData(['tickets', filters], (old: Ticket[] = []) => {
        return old.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket));
      });
    });

    const unsubscribeDeleted = realtimeService.onTicketDeleted((deletedId) => {
      queryClient.setQueryData(['tickets', filters], (old: Ticket[] = []) => {
        return old.filter((ticket) => ticket.id !== deletedId);
      });
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [filters, queryClient, realtimeService]);

  return {
    tickets,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para obter um ticket específico
 */
export function useTicket(ticketId: string) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketRepository.getById(ticketId),
    enabled: !!ticketId,
  });
}

/**
 * Hook para mutations de tickets
 */
export function useTicketMutations() {
  const queryClient = useQueryClient();

  // Criar ticket
  const createMutation = useMutation({
    mutationFn: (data: CreateTicketInput) => ticketRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Atualizar ticket
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) => ticketRepository.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
    },
  });

  // Deletar ticket
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ticketRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Mover ticket (atualizar status)
  const moveTicket = async (ticketId: string, fromColumn: string, toColumn: string) => {
    await updateMutation.mutateAsync({
      id: ticketId,
      data: { status: toColumn as any },
    });
  };

  // Atribuir ticket
  const assignMutation = useMutation({
    mutationFn: ({ ticketId, assigneeId }: { ticketId: string; assigneeId: string }) =>
      ticketRepository.assign(ticketId, assigneeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
    },
  });

  return {
    createTicket: createMutation.mutate,
    updateTicket: updateMutation.mutate,
    deleteTicket: deleteMutation.mutate,
    assignTicket: assignMutation.mutate,
    moveTicket,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook para verificar SLA de um ticket
 */
export function useTicketSLA(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-sla', ticketId],
    queryFn: () => ticketRepository.checkSLA(ticketId),
    enabled: !!ticketId,
    refetchInterval: 60000, // Refetch a cada 1 minuto
  });
}

/**
 * Hook para obter tickets com SLA violado
 */
export function useSLABreachedTickets() {
  return useQuery({
    queryKey: ['tickets-sla-breached'],
    queryFn: () => ticketRepository.getSLABreached(),
    refetchInterval: 60000, // Refetch a cada 1 minuto
  });
}
