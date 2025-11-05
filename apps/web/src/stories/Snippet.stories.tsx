import type { Meta, StoryObj } from '@storybook/react';
import { Snippet } from '@heroui/snippet';

const meta: Meta<typeof Snippet> = {
  title: 'HeroUI/Snippet',
  component: Snippet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'npm install @heroui/react',
  },
};

export const Installation: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Snippet symbol="$">npm install @heroui/react</Snippet>
      <Snippet symbol="$">yarn add @heroui/react</Snippet>
      <Snippet symbol="$">pnpm add @heroui/react</Snippet>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Snippet color="default">Default snippet</Snippet>
      <Snippet color="primary">Primary snippet</Snippet>
      <Snippet color="secondary">Secondary snippet</Snippet>
      <Snippet color="success">Success snippet</Snippet>
      <Snippet color="warning">Warning snippet</Snippet>
      <Snippet color="danger">Danger snippet</Snippet>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Snippet size="sm">Small snippet</Snippet>
      <Snippet size="md">Medium snippet</Snippet>
      <Snippet size="lg">Large snippet</Snippet>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Snippet variant="flat">Flat variant</Snippet>
      <Snippet variant="solid">Solid variant</Snippet>
      <Snippet variant="bordered">Bordered variant</Snippet>
      <Snippet variant="shadow">Shadow variant</Snippet>
    </div>
  ),
};

export const MultiLine: Story = {
  args: {
    children: `DATABASE_URL=postgresql://localhost:5432/db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key`,
  },
};

export const HideSymbol: Story = {
  args: {
    children: 'pnpm dev',
    hideSymbol: true,
  },
};

export const CustomTooltip: Story = {
  args: {
    children: 'git clone https://github.com/ghitflux/ghitdesk.git',
    tooltipProps: {
      content: 'Copied to clipboard!',
    },
  },
};

export const APIKeys: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Snippet color="warning" hideSymbol>
        WHATSAPP_API_TOKEN=EAAabc123xyz...
      </Snippet>
      <Snippet color="primary" hideSymbol>
        TELEGRAM_BOT_TOKEN=123456:ABCdef...
      </Snippet>
      <Snippet color="success" hideSymbol>
        SMTP_PASSWORD=your-app-password
      </Snippet>
    </div>
  ),
};

export const GitCommands: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <Snippet symbol="$">git clone https://github.com/ghitflux/ghitdesk.git</Snippet>
      <Snippet symbol="$">cd ghitdesk</Snippet>
      <Snippet symbol="$">pnpm install</Snippet>
      <Snippet symbol="$">pnpm dev</Snippet>
    </div>
  ),
};
