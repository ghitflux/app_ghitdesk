import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from '@heroui/chip';
import { CheckCircle, X } from 'lucide-react';

const meta: Meta<typeof Chip> = {
  title: 'HeroUI/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Chip',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <Chip color="default">Default</Chip>
      <Chip color="primary">Primary</Chip>
      <Chip color="secondary">Secondary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <Chip variant="solid" color="primary">Solid</Chip>
      <Chip variant="bordered" color="primary">Bordered</Chip>
      <Chip variant="flat" color="primary">Flat</Chip>
      <Chip variant="faded" color="primary">Faded</Chip>
      <Chip variant="dot" color="primary">Dot</Chip>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-3 items-center">
      <Chip size="sm" color="primary">Small</Chip>
      <Chip size="md" color="primary">Medium</Chip>
      <Chip size="lg" color="primary">Large</Chip>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <Chip
        color="success"
        variant="flat"
        startContent={<CheckCircle size={16} />}
      >
        Verified
      </Chip>
      <Chip
        color="danger"
        variant="flat"
        endContent={<X size={16} />}
        onClose={() => alert('Closed!')}
      >
        Closable
      </Chip>
    </div>
  ),
};
