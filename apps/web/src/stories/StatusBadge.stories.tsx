import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '@/components/ghitdesk/status-badge';

const meta: Meta<typeof StatusBadge> = {
  title: 'GhitDesk/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

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

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <StatusBadge status="open" />
      <StatusBadge status="in_progress" />
      <StatusBadge status="resolved" />
      <StatusBadge status="closed" />
    </div>
  ),
};
