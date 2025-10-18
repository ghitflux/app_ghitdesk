import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@heroui/button';

const meta: Meta<typeof Button> = {
  title: 'HeroUI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button color="default">Default</Button>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="solid" color="primary">Solid</Button>
      <Button variant="bordered" color="primary">Bordered</Button>
      <Button variant="flat" color="primary">Flat</Button>
      <Button variant="faded" color="primary">Faded</Button>
      <Button variant="shadow" color="primary">Shadow</Button>
      <Button variant="ghost" color="primary">Ghost</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="sm" color="primary">Small</Button>
      <Button size="md" color="primary">Medium</Button>
      <Button size="lg" color="primary">Large</Button>
    </div>
  ),
};
