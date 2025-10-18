import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@heroui/progress';

const meta: Meta<typeof Progress> = {
  title: 'HeroUI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Loading...',
    value: 60,
    className: 'max-w-md',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <Progress color="default" value={60} aria-label="Default" />
      <Progress color="primary" value={60} aria-label="Primary" />
      <Progress color="secondary" value={60} aria-label="Secondary" />
      <Progress color="success" value={60} aria-label="Success" />
      <Progress color="warning" value={60} aria-label="Warning" />
      <Progress color="danger" value={60} aria-label="Danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <Progress size="sm" value={60} aria-label="Small" />
      <Progress size="md" value={60} aria-label="Medium" />
      <Progress size="lg" value={60} aria-label="Large" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <Progress
        label="Uploading..."
        value={65}
        color="primary"
        showValueLabel
        aria-label="Uploading"
      />
      <Progress
        label="Processing"
        value={40}
        color="success"
        showValueLabel
        aria-label="Processing"
      />
    </div>
  ),
};

export const Indeterminate: Story = {
  args: {
    'aria-label': 'Loading...',
    isIndeterminate: true,
    color: 'primary',
    className: 'max-w-md',
  },
};
