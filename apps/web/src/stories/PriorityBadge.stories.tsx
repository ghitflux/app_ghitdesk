import type { Meta, StoryObj } from '@storybook/react';
import { PriorityBadge } from '@/components/ghitdesk/priority-badge';

const meta: Meta<typeof PriorityBadge> = {
  title: 'GhitDesk/PriorityBadge',
  component: PriorityBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

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

export const AllPriorities: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <PriorityBadge priority="low" />
      <PriorityBadge priority="medium" />
      <PriorityBadge priority="high" />
      <PriorityBadge priority="urgent" />
    </div>
  ),
};
