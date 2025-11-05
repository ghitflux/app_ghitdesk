import type { Meta, StoryObj } from '@storybook/react';
import { Kbd } from '@heroui/kbd';

const meta: Meta<typeof Kbd> = {
  title: 'HeroUI/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Enter',
  },
};

export const KeyCombinations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span>Save:</span>
        <Kbd keys={['command']}>S</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Copy:</span>
        <Kbd keys={['command']}>C</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Paste:</span>
        <Kbd keys={['command']}>V</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Undo:</span>
        <Kbd keys={['command']}>Z</Kbd>
      </div>
    </div>
  ),
};

export const MultipleKeys: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span>Select All:</span>
        <Kbd keys={['command']}>A</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Find:</span>
        <Kbd keys={['command']}>F</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Bold:</span>
        <Kbd keys={['command']}>B</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>New Tab:</span>
        <Kbd keys={['command']}>T</Kbd>
      </div>
    </div>
  ),
};

export const ModifierKeys: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span>Command:</span>
        <Kbd keys={['command']} />
      </div>
      <div className="flex items-center gap-2">
        <span>Shift:</span>
        <Kbd keys={['shift']} />
      </div>
      <div className="flex items-center gap-2">
        <span>Control:</span>
        <Kbd keys={['ctrl']} />
      </div>
      <div className="flex items-center gap-2">
        <span>Option:</span>
        <Kbd keys={['option']} />
      </div>
    </div>
  ),
};

export const ArrowKeys: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span>Up:</span>
        <Kbd>↑</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Down:</span>
        <Kbd>↓</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Left:</span>
        <Kbd>←</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Right:</span>
        <Kbd>→</Kbd>
      </div>
    </div>
  ),
};

export const ApplicationShortcuts: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">GhitDesk Shortcuts</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between items-center">
          <span>New Ticket</span>
          <Kbd keys={['command']}>N</Kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>Search</span>
          <Kbd keys={['command']}>K</Kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>Settings</span>
          <Kbd keys={['command']}>,</Kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>Close</span>
          <Kbd>Esc</Kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>Next Ticket</span>
          <Kbd keys={['command']}>↓</Kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>Previous Ticket</span>
          <Kbd keys={['command']}>↑</Kbd>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Kbd size="sm">Esc</Kbd>
      <Kbd size="md">Enter</Kbd>
      <Kbd size="lg">Space</Kbd>
    </div>
  ),
};
