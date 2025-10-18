import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '@heroui/tooltip';
import { Button } from '@heroui/button';

const meta: Meta<typeof Tooltip> = {
  title: 'HeroUI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Tooltip content="Default tooltip" color="default">
        <Button variant="flat">Default</Button>
      </Tooltip>
      <Tooltip content="Primary tooltip" color="primary">
        <Button variant="flat">Primary</Button>
      </Tooltip>
      <Tooltip content="Secondary tooltip" color="secondary">
        <Button variant="flat">Secondary</Button>
      </Tooltip>
      <Tooltip content="Success tooltip" color="success">
        <Button variant="flat">Success</Button>
      </Tooltip>
      <Tooltip content="Warning tooltip" color="warning">
        <Button variant="flat">Warning</Button>
      </Tooltip>
      <Tooltip content="Danger tooltip" color="danger">
        <Button variant="flat">Danger</Button>
      </Tooltip>
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-8">
      <div></div>
      <Tooltip content="Top" placement="top">
        <Button>Top</Button>
      </Tooltip>
      <div></div>

      <Tooltip content="Left" placement="left">
        <Button>Left</Button>
      </Tooltip>
      <div></div>
      <Tooltip content="Right" placement="right">
        <Button>Right</Button>
      </Tooltip>

      <div></div>
      <Tooltip content="Bottom" placement="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <div></div>
    </div>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="Tooltip with arrow" showArrow>
        <Button color="primary">Hover me</Button>
      </Tooltip>
    </div>
  ),
};

export const Delayed: Story = {
  args: {
    content: 'This tooltip appears after a delay',
    delay: 500,
    children: <Button color="secondary">Hover me (delayed)</Button>,
  },
};
