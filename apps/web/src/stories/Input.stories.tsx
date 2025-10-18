import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@heroui/input';

const meta: Meta<typeof Input> = {
  title: 'HeroUI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Input color="default" label="Default" placeholder="Enter text" />
      <Input color="primary" label="Primary" placeholder="Enter text" />
      <Input color="secondary" label="Secondary" placeholder="Enter text" />
      <Input color="success" label="Success" placeholder="Enter text" />
      <Input color="warning" label="Warning" placeholder="Enter text" />
      <Input color="danger" label="Danger" placeholder="Enter text" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Input variant="flat" label="Flat" placeholder="Enter text" />
      <Input variant="bordered" label="Bordered" placeholder="Enter text" />
      <Input variant="faded" label="Faded" placeholder="Enter text" />
      <Input variant="underlined" label="Underlined" placeholder="Enter text" />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    description: 'We will never share your email with anyone else.',
  },
};
