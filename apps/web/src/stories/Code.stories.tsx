import type { Meta, StoryObj } from '@storybook/react';
import { Code } from '@heroui/code';

const meta: Meta<typeof Code> = {
  title: 'HeroUI/Code',
  component: Code,
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

export const Inline: Story = {
  render: () => (
    <p>
      To install the package, run{' '}
      <Code>npm install @heroui/react</Code> in your terminal.
    </p>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Code color="default">Default code</Code>
      <Code color="primary">Primary code</Code>
      <Code color="secondary">Secondary code</Code>
      <Code color="success">Success code</Code>
      <Code color="warning">Warning code</Code>
      <Code color="danger">Danger code</Code>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Code size="sm">Small code snippet</Code>
      <Code size="md">Medium code snippet</Code>
      <Code size="lg">Large code snippet</Code>
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Code radius="none">No radius</Code>
      <Code radius="sm">Small radius</Code>
      <Code radius="md">Medium radius</Code>
      <Code radius="lg">Large radius</Code>
      <Code radius="full">Full radius</Code>
    </div>
  ),
};

export const CommandLine: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Code>$ cd /home/user/ghitdesk</Code>
      <Code>$ pnpm install</Code>
      <Code>$ pnpm dev</Code>
    </div>
  ),
};

export const APIEndpoint: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Code color="success">GET</Code>
        <Code>/api/tickets</Code>
      </div>
      <div className="flex items-center gap-2">
        <Code color="primary">POST</Code>
        <Code>/api/tickets</Code>
      </div>
      <div className="flex items-center gap-2">
        <Code color="warning">PUT</Code>
        <Code>/api/tickets/:id</Code>
      </div>
      <div className="flex items-center gap-2">
        <Code color="danger">DELETE</Code>
        <Code>/api/tickets/:id</Code>
      </div>
    </div>
  ),
};

export const EnvironmentVariables: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Code>DATABASE_URL=postgresql://localhost:5432/db</Code>
      <Code>REDIS_URL=redis://localhost:6379</Code>
      <Code>JWT_SECRET=your-secret-key</Code>
    </div>
  ),
};
