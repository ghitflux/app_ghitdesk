import type { Meta, StoryObj } from '@storybook/react';
import { User } from '@heroui/user';

const meta: Meta<typeof User> = {
  title: 'HeroUI/User',
  component: User,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'João Silva',
    description: 'Product Designer',
    avatarProps: {
      src: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    },
  },
};

export const WithoutAvatar: Story = {
  args: {
    name: 'Maria Santos',
    description: 'Software Engineer',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <User
        name="João Silva"
        description="Product Designer"
        avatarProps={{
          src: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        }}
      />
      <User
        name="Maria Santos"
        description="maria@ghitdesk.com"
        avatarProps={{
          src: 'https://i.pravatar.cc/150?u=a092581f4e29026704d',
        }}
      />
      <User
        name="Pedro Costa"
        description="Admin"
        avatarProps={{
          src: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        }}
      />
    </div>
  ),
};

export const WithCustomAvatar: Story = {
  args: {
    name: 'Ana Oliveira',
    description: 'Team Lead',
    avatarProps: {
      src: 'https://i.pravatar.cc/150?u=a042581f4e29027007d',
      color: 'primary',
      isBordered: true,
    },
  },
};

export const LinkBehavior: Story = {
  args: {
    name: 'Carlos Souza',
    description: 'View Profile',
    avatarProps: {
      src: 'https://i.pravatar.cc/150?u=a042581f4e29027008d',
    },
  },
};

export const WithStatus: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <User
        name="Online User"
        description="Available"
        avatarProps={{
          src: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
          color: 'success',
          isBordered: true,
        }}
      />
      <User
        name="Busy User"
        description="In a meeting"
        avatarProps={{
          src: 'https://i.pravatar.cc/150?u=a092581f4e29026704d',
          color: 'warning',
          isBordered: true,
        }}
      />
      <User
        name="Offline User"
        description="Away"
        avatarProps={{
          src: 'https://i.pravatar.cc/150?u=a042581f4e29027007d',
          color: 'default',
          isBordered: true,
        }}
      />
    </div>
  ),
};
