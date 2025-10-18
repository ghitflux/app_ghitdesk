import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '@heroui/divider';
import { Card, CardHeader, CardBody } from '@heroui/card';

const meta: Meta<typeof Divider> = {
  title: 'HeroUI/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <p className="text-sm">Content above divider</p>
      <Divider />
      <p className="text-sm">Content below divider</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center gap-4">
      <p className="text-sm">Left content</p>
      <Divider orientation="vertical" />
      <p className="text-sm">Right content</p>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Header</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="text-sm text-default-600">
          This is the card body content separated by a divider.
        </p>
      </CardBody>
    </Card>
  ),
};
