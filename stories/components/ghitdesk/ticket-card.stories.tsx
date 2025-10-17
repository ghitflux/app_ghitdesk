import type { Meta, StoryObj } from '@storybook/react';
import { TicketCard } from '@/components/ghitdesk/ticket-card';

const meta = {
  title: 'GhitDesk/TicketCard',
  component: TicketCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TicketCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '#TICKET-12345',
    title: 'Erro no login do sistema',
    description: 'Cliente reportando erro ao tentar fazer login. Mensagem de erro: "Credenciais inválidas"',
    status: 'in_progress',
    priority: 'high',
    channel: 'whatsapp',
    assignee: {
      name: 'João Silva',
    },
    messageCount: 3,
    slaRemaining: '2h restantes',
    createdAt: 'há 4h',
  },
};

export const UrgentTicket: Story = {
  args: {
    id: '#TICKET-99999',
    title: 'Sistema completamente fora do ar',
    description: 'Todos os clientes reportando que não conseguem acessar a plataforma. Erro 500 em todas as páginas.',
    status: 'open',
    priority: 'urgent',
    channel: 'email',
    messageCount: 12,
    slaRemaining: '30min restantes',
    createdAt: 'há 1h',
  },
};

export const UnassignedTicket: Story = {
  args: {
    id: '#TICKET-00123',
    title: 'Dúvida sobre planos',
    description: 'Cliente perguntando sobre as diferenças entre o plano Pro e Enterprise.',
    status: 'open',
    priority: 'low',
    channel: 'telegram',
    messageCount: 1,
    slaRemaining: '24h restantes',
    createdAt: 'há 10min',
  },
};

export const ResolvedTicket: Story = {
  args: {
    id: '#TICKET-45678',
    title: 'Bug no checkout corrigido',
    description: 'Bug identificado e corrigido. Cliente confirmou que consegue finalizar compras normalmente.',
    status: 'resolved',
    priority: 'medium',
    channel: 'whatsapp',
    assignee: {
      name: 'Maria Santos',
    },
    messageCount: 8,
    createdAt: 'há 2 dias',
  },
};

export const ClosedTicket: Story = {
  args: {
    id: '#TICKET-11111',
    title: 'Solicitação de funcionalidade implementada',
    description: 'Cliente solicitou funcionalidade de exportação de relatórios. Implementado e entregue.',
    status: 'closed',
    priority: 'low',
    channel: 'email',
    assignee: {
      name: 'Pedro Oliveira',
    },
    messageCount: 15,
    createdAt: 'há 1 semana',
  },
};

export const TicketList: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <TicketCard
        id="#TICKET-001"
        title="Sistema fora do ar"
        description="Clientes não conseguem acessar desde as 14h"
        status="open"
        priority="urgent"
        channel="whatsapp"
        messageCount={5}
        slaRemaining="15min restantes"
        createdAt="há 30min"
      />
      <TicketCard
        id="#TICKET-002"
        title="Erro no pagamento"
        description="Cartão recusado sem motivo aparente"
        status="in_progress"
        priority="high"
        channel="email"
        assignee={{ name: 'Ana Costa' }}
        messageCount={3}
        slaRemaining="2h restantes"
        createdAt="há 4h"
      />
      <TicketCard
        id="#TICKET-003"
        title="Dúvida sobre API"
        description="Como integrar com webhook de pedidos?"
        status="open"
        priority="medium"
        channel="telegram"
        assignee={{ name: 'Carlos Silva' }}
        messageCount={2}
        slaRemaining="12h restantes"
        createdAt="há 1 dia"
      />
      <TicketCard
        id="#TICKET-004"
        title="Problema resolvido"
        description="Cliente conseguiu completar o processo"
        status="resolved"
        priority="low"
        channel="whatsapp"
        assignee={{ name: 'João Silva' }}
        messageCount={6}
        createdAt="há 2 dias"
      />
    </div>
  ),
};

export const DifferentPriorities: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <TicketCard
        id="#TICKET-LOW"
        title="Sugestão de melhoria"
        description="Adicionar dark mode na interface"
        status="open"
        priority="low"
        channel="email"
        messageCount={1}
        createdAt="há 3 dias"
      />
      <TicketCard
        id="#TICKET-MEDIUM"
        title="Bug visual no mobile"
        description="Botão desalinhado na tela de checkout"
        status="in_progress"
        priority="medium"
        channel="whatsapp"
        assignee={{ name: 'Maria Santos' }}
        messageCount={4}
        createdAt="há 1 dia"
      />
      <TicketCard
        id="#TICKET-HIGH"
        title="Erro ao processar pedido"
        description="Pedidos não estão sendo processados corretamente"
        status="open"
        priority="high"
        channel="telegram"
        messageCount={7}
        slaRemaining="3h restantes"
        createdAt="há 6h"
      />
      <TicketCard
        id="#TICKET-URGENT"
        title="Sistema crítico fora"
        description="Banco de dados não responde"
        status="open"
        priority="urgent"
        channel="email"
        messageCount={15}
        slaRemaining="20min restantes"
        createdAt="há 40min"
      />
    </div>
  ),
};
