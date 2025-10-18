import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '@heroui/spinner';

const meta: Meta<typeof Spinner> = {
  title: 'HeroUI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <Spinner color="default" />
      <Spinner color="primary" />
      <Spinner color="secondary" />
      <Spinner color="success" />
      <Spinner color="warning" />
      <Spinner color="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <Spinner size="sm" color="primary" />
      <Spinner size="md" color="primary" />
      <Spinner size="lg" color="primary" />
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    label: 'Loading...',
    color: 'primary',
  },
};

export const LabelColors: Story = {
  render: () => (
    <div className="flex gap-8 items-center flex-wrap">
      <Spinner label="Default" color="default" />
      <Spinner label="Primary" color="primary" />
      <Spinner label="Success" color="success" />
      <Spinner label="Warning" color="warning" />
      <Spinner label="Danger" color="danger" />
    </div>
  ),
};
