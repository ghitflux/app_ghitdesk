import type { Meta, StoryObj } from '@storybook/react';
import { TicketCard } from '@/components/ghitdesk/ticket-card';

const meta: Meta<typeof TicketCard> = {
  title: 'GhitDesk/TicketCard',
  component: TicketCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '#TICKET-001',
    title: 'Sistema fora do ar',
    description: 'Clientes não conseguem acessar o sistema desde as 14h. Necessário investigação urgente.',
    status: 'open',
    priority: 'urgent',
    channel: 'whatsapp',
    messageCount: 5,
    slaRemaining: '15min restantes',
    createdAt: 'há 30min',
  },
};

export const WithAssignee: Story = {
  args: {
    id: '#TICKET-002',
    title: 'Bug no checkout',
    description: 'Erro ao finalizar compra com cartão de crédito. Cliente reportou que o botão não responde.',
    status: 'in_progress',
    priority: 'high',
    channel: 'email',
    messageCount: 3,
    slaRemaining: '2h restantes',
    createdAt: 'há 4h',
    assignee: {
      name: 'João Silva',
    },
  },
};

export const LowPriority: Story = {
  args: {
    id: '#TICKET-003',
    title: 'Sugestão de melhoria',
    description: 'Cliente sugeriu adicionar filtro por data na página de relatórios.',
    status: 'open',
    priority: 'low',
    channel: 'telegram',
    messageCount: 1,
    createdAt: 'há 2 dias',
  },
};

export const Resolved: Story = {
  args: {
    id: '#TICKET-004',
    title: 'Problema de login resolvido',
    description: 'Cliente não conseguia fazer login. Foi resetada a senha e problema foi resolvido.',
    status: 'resolved',
    priority: 'medium',
    channel: 'twitter',
    messageCount: 8,
    createdAt: 'há 5h',
    assignee: {
      name: 'Maria Santos',
    },
  },
};

export const AllVariations: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 w-full max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TicketCard
          id="#TICKET-001"
          title="Sistema fora do ar"
          description="Clientes não conseguem acessar o sistema desde as 14h."
          status="open"
          priority="urgent"
          channel="whatsapp"
          messageCount={5}
          slaRemaining="15min restantes"
          createdAt="há 30min"
        />
        <TicketCard
          id="#TICKET-002"
          title="Bug no checkout"
          description="Erro ao finalizar compra com cartão de crédito"
          status="in_progress"
          priority="high"
          channel="email"
          messageCount={3}
          slaRemaining="2h restantes"
          createdAt="há 4h"
          assignee={{ name: 'João Silva' }}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TicketCard
          id="#TICKET-003"
          title="Sugestão de melhoria"
          description="Cliente sugeriu adicionar filtro por data"
          status="open"
          priority="low"
          channel="telegram"
          messageCount={1}
          createdAt="há 2 dias"
        />
        <TicketCard
          id="#TICKET-004"
          title="Problema resolvido"
          description="Cliente não conseguia fazer login"
          status="resolved"
          priority="medium"
          channel="twitter"
          messageCount={8}
          createdAt="há 5h"
          assignee={{ name: 'Maria Santos' }}
        />
      </div>
    </div>
  ),
};
