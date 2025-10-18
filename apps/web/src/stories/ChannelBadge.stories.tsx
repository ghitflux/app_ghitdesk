import type { Meta, StoryObj } from '@storybook/react';
import { ChannelBadge } from '@/components/ghitdesk/channel-badge';

const meta: Meta<typeof ChannelBadge> = {
  title: 'GhitDesk/ChannelBadge',
  component: ChannelBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WhatsApp: Story = {
  args: {
    channel: 'whatsapp',
  },
};

export const Email: Story = {
  args: {
    channel: 'email',
  },
};

export const Telegram: Story = {
  args: {
    channel: 'telegram',
  },
};

export const Twitter: Story = {
  args: {
    channel: 'twitter',
  },
};

export const AllChannels: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <ChannelBadge channel="whatsapp" />
      <ChannelBadge channel="email" />
      <ChannelBadge channel="telegram" />
      <ChannelBadge channel="twitter" />
    </div>
  ),
};
