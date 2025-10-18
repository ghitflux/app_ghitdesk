import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '@heroui/avatar';

const meta: Meta<typeof Avatar> = {
  title: 'HeroUI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Jane Doe',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    name: 'Jane Doe',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar size="sm" name="Small" />
      <Avatar size="md" name="Medium" />
      <Avatar size="lg" name="Large" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar color="default" name="Default" />
      <Avatar color="primary" name="Primary" />
      <Avatar color="secondary" name="Secondary" />
      <Avatar color="success" name="Success" />
      <Avatar color="warning" name="Warning" />
      <Avatar color="danger" name="Danger" />
    </div>
  ),
};

export const WithBadge: Story = {
  args: {
    name: 'Jane Doe',
    isBordered: true,
    color: 'primary',
  },
};
