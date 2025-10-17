import type { Meta, StoryObj } from '@storybook/react';
import { ChannelBadge } from '@/components/ghitdesk/channel-badge';

const meta = {
  title: 'GhitDesk/ChannelBadge',
  component: ChannelBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    channel: {
      control: 'select',
      options: ['whatsapp', 'email', 'telegram', 'twitter'],
      description: 'Canal de comunicação',
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
} satisfies Meta<typeof ChannelBadge>;

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

export const WithoutIcon: Story = {
  args: {
    channel: 'whatsapp',
    showIcon: false,
  },
};

export const AllChannels: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <ChannelBadge channel="whatsapp" />
      <ChannelBadge channel="email" />
      <ChannelBadge channel="telegram" />
      <ChannelBadge channel="twitter" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <ChannelBadge channel="whatsapp" size="sm" />
      <ChannelBadge channel="whatsapp" size="md" />
      <ChannelBadge channel="whatsapp" size="lg" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <ChannelBadge channel="whatsapp" variant="solid" />
      <ChannelBadge channel="whatsapp" variant="bordered" />
      <ChannelBadge channel="whatsapp" variant="flat" />
      <ChannelBadge channel="whatsapp" variant="faded" />
      <ChannelBadge channel="whatsapp" variant="shadow" />
      <ChannelBadge channel="whatsapp" variant="dot" />
    </div>
  ),
};

export const InConversationList: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      <div className="flex justify-between items-center p-3 border border-default-200 rounded-lg">
        <div>
          <p className="font-medium">Maria Santos</p>
          <p className="text-sm text-default-500">Preciso de ajuda com...</p>
        </div>
        <ChannelBadge channel="whatsapp" size="sm" variant="dot" />
      </div>
      <div className="flex justify-between items-center p-3 border border-default-200 rounded-lg">
        <div>
          <p className="font-medium">João Silva</p>
          <p className="text-sm text-default-500">Re: Problema no pedido</p>
        </div>
        <ChannelBadge channel="email" size="sm" variant="dot" />
      </div>
      <div className="flex justify-between items-center p-3 border border-default-200 rounded-lg">
        <div>
          <p className="font-medium">Ana Costa</p>
          <p className="text-sm text-default-500">Dúvida sobre integração</p>
        </div>
        <ChannelBadge channel="telegram" size="sm" variant="dot" />
      </div>
    </div>
  ),
};

export const ChannelFilter: Story = {
  render: () => (
    <div className="w-96">
      <p className="text-sm text-default-500 mb-3">Filtrar por canal:</p>
      <div className="flex gap-2 flex-wrap">
        <ChannelBadge channel="whatsapp" size="sm" variant="flat" />
        <ChannelBadge channel="email" size="sm" variant="flat" />
        <ChannelBadge channel="telegram" size="sm" variant="flat" />
        <ChannelBadge channel="twitter" size="sm" variant="flat" />
      </div>
    </div>
  ),
};
