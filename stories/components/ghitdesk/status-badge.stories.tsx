import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '@/components/ghitdesk/status-badge';

const meta = {
  title: 'GhitDesk/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['open', 'in_progress', 'resolved', 'closed'],
      description: 'Status do ticket ou conversa',
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
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    status: 'open',
  },
};

export const InProgress: Story = {
  args: {
    status: 'in_progress',
  },
};

export const Resolved: Story = {
  args: {
    status: 'resolved',
  },
};

export const Closed: Story = {
  args: {
    status: 'closed',
  },
};

export const WithoutIcon: Story = {
  args: {
    status: 'in_progress',
    showIcon: false,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <StatusBadge status="open" />
      <StatusBadge status="in_progress" />
      <StatusBadge status="resolved" />
      <StatusBadge status="closed" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <StatusBadge status="in_progress" size="sm" />
      <StatusBadge status="in_progress" size="md" />
      <StatusBadge status="in_progress" size="lg" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <StatusBadge status="open" variant="solid" />
      <StatusBadge status="open" variant="bordered" />
      <StatusBadge status="open" variant="flat" />
      <StatusBadge status="open" variant="faded" />
      <StatusBadge status="open" variant="shadow" />
      <StatusBadge status="open" variant="dot" />
    </div>
  ),
};

export const InTicketList: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      <div className="flex justify-between items-center p-3 border border-default-200 rounded-lg">
        <div>
          <p className="font-medium">#TICKET-001</p>
          <p className="text-sm text-default-500">Erro no login</p>
        </div>
        <StatusBadge status="open" />
      </div>
      <div className="flex justify-between items-center p-3 border border-default-200 rounded-lg">
        <div>
          <p className="font-medium">#TICKET-002</p>
          <p className="text-sm text-default-500">Bug no checkout</p>
        </div>
        <StatusBadge status="in_progress" />
      </div>
      <div className="flex justify-between items-center p-3 border border-default-200 rounded-lg">
        <div>
          <p className="font-medium">#TICKET-003</p>
          <p className="text-sm text-default-500">Dúvida sobre planos</p>
        </div>
        <StatusBadge status="resolved" />
      </div>
    </div>
  ),
};
