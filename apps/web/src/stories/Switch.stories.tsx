import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@heroui/switch';

const meta: Meta<typeof Switch> = {
  title: 'HeroUI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Enable notifications',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch color="default">Default</Switch>
      <Switch color="primary">Primary</Switch>
      <Switch color="secondary">Secondary</Switch>
      <Switch color="success">Success</Switch>
      <Switch color="warning">Warning</Switch>
      <Switch color="danger">Danger</Switch>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch size="sm">Small</Switch>
      <Switch size="md">Medium</Switch>
      <Switch size="lg">Large</Switch>
    </div>
  ),
};
