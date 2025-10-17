import type { Meta, StoryObj } from '@storybook/react';
import { PriorityBadge } from '@/components/ghitdesk/priority-badge';

const meta = {
  title: 'GhitDesk/PriorityBadge',
  component: PriorityBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['low', 'medium', 'high', 'urgent'],
      description: 'Prioridade do ticket',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['solid', 'bordered', 'flat', 'faded', 'shadow', 'dot'],
    },
  },
} satisfies Meta<typeof PriorityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Low: Story = {
  args: {
    priority: 'low',
  },
};

export const Medium: Story = {
  args: {
    priority: 'medium',
  },
};

export const High: Story = {
  args: {
    priority: 'high',
  },
};

export const Urgent: Story = {
  args: {
    priority: 'urgent',
  },
};

export const WithoutIcon: Story = {
  args: {
    priority: 'high',
    showIcon: false,
  },
};

export const AllPriorities: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <PriorityBadge priority="low" />
      <PriorityBadge priority="medium" />
      <PriorityBadge priority="high" />
      <PriorityBadge priority="urgent" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <PriorityBadge priority="urgent" size="sm" />
      <PriorityBadge priority="urgent" size="md" />
      <PriorityBadge priority="urgent" size="lg" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <PriorityBadge priority="high" variant="solid" />
      <PriorityBadge priority="high" variant="bordered" />
      <PriorityBadge priority="high" variant="flat" />
      <PriorityBadge priority="high" variant="faded" />
      <PriorityBadge priority="high" variant="shadow" />
      <PriorityBadge priority="high" variant="dot" />
    </div>
  ),
};

export const InTicketHeader: Story = {
  render: () => (
    <div className="w-96 p-4 border border-default-200 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-default-500">#TICKET-12345</p>
          <h3 className="text-lg font-semibold">Sistema fora do ar</h3>
        </div>
        <PriorityBadge priority="urgent" variant="bordered" />
      </div>
      <p className="text-default-600 mb-3">
        Clientes não conseguem acessar o sistema desde as 14h.
        Necessário investigação urgente.
      </p>
      <div className="flex gap-2 text-sm text-default-500">
        <span>Criado há 30min</span>
        <span>•</span>
        <span>João Silva</span>
      </div>
    </div>
  ),
};

export const PriorityComparison: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
        <span className="text-sm">Tickets Baixa Prioridade</span>
        <PriorityBadge priority="low" size="sm" />
      </div>
      <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
        <span className="text-sm">Tickets Média Prioridade</span>
        <PriorityBadge priority="medium" size="sm" />
      </div>
      <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
        <span className="text-sm">Tickets Alta Prioridade</span>
        <PriorityBadge priority="high" size="sm" />
      </div>
      <div className="flex justify-between items-center p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
        <span className="text-sm font-medium">Tickets Urgentes</span>
        <PriorityBadge priority="urgent" size="sm" variant="solid" />
      </div>
    </div>
  ),
};
