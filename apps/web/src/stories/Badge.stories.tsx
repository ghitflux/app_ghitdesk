import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@heroui/badge';
import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { ShoppingCart } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'HeroUI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 5,
    children: (
      <Button>Notifications</Button>
    ),
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <Badge content={5} color="default">
        <Button variant="flat">Default</Button>
      </Badge>
      <Badge content={5} color="primary">
        <Button variant="flat">Primary</Button>
      </Badge>
      <Badge content={5} color="secondary">
        <Button variant="flat">Secondary</Button>
      </Badge>
      <Badge content={5} color="success">
        <Button variant="flat">Success</Button>
      </Badge>
      <Badge content={5} color="warning">
        <Button variant="flat">Warning</Button>
      </Badge>
      <Badge content={5} color="danger">
        <Button variant="flat">Danger</Button>
      </Badge>
    </div>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <Badge content={5} color="danger">
      <Avatar
        src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
        size="lg"
      />
    </Badge>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Badge content={3} color="danger">
      <Button isIconOnly variant="light">
        <ShoppingCart size={20} />
      </Button>
    </Badge>
  ),
};

export const Dot: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <Badge content="" color="success" shape="circle">
        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
      </Badge>
      <Badge content="" color="danger" shape="circle">
        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
      </Badge>
    </div>
  ),
};
