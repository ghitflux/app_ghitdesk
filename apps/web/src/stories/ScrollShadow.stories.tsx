import type { Meta, StoryObj } from '@storybook/react';
import { ScrollShadow } from '@heroui/scroll-shadow';

const meta: Meta<typeof ScrollShadow> = {
  title: 'HeroUI/ScrollShadow',
  component: ScrollShadow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const longText = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}: This is a sample line of text.`).join('\n');

export const Default: Story = {
  render: () => (
    <ScrollShadow className="w-[300px] h-[200px]">
      <div className="whitespace-pre-wrap p-4">{longText}</div>
    </ScrollShadow>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ScrollShadow orientation="vertical" className="w-[300px] h-[200px]">
      <div className="whitespace-pre-wrap p-4">{longText}</div>
    </ScrollShadow>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollShadow orientation="horizontal" className="w-[300px] h-[100px]">
      <div className="whitespace-nowrap p-4">
        This is a very long horizontal text that will scroll horizontally and show shadow on both sides when scrolling
      </div>
    </ScrollShadow>
  ),
};

export const CustomSize: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ScrollShadow size={20} className="w-[300px] h-[200px]">
        <div className="whitespace-pre-wrap p-4">{longText}</div>
      </ScrollShadow>
      <p className="text-sm text-default-500">Shadow size: 20px</p>
    </div>
  ),
};

export const TicketList: Story = {
  render: () => (
    <ScrollShadow className="w-[400px] h-[300px] border rounded-lg">
      <div className="p-4 space-y-4">
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="p-3 border rounded bg-default-50">
            <h4 className="font-semibold">Ticket #{i + 1}</h4>
            <p className="text-sm text-default-500">
              Issue description for ticket {i + 1}
            </p>
          </div>
        ))}
      </div>
    </ScrollShadow>
  ),
};

export const MessageHistory: Story = {
  render: () => (
    <ScrollShadow className="w-[350px] h-[400px] border rounded-lg bg-default-50">
      <div className="p-4 space-y-3">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${
              i % 2 === 0
                ? 'bg-primary text-white ml-auto'
                : 'bg-white border'
            }`}
          >
            <p className="text-sm">
              {i % 2 === 0 ? 'Outbound' : 'Inbound'} message {i + 1}
            </p>
            <span className="text-xs opacity-70">10:30 AM</span>
          </div>
        ))}
      </div>
    </ScrollShadow>
  ),
};

export const HideScrollbar: Story = {
  render: () => (
    <ScrollShadow hideScrollBar className="w-[300px] h-[200px]">
      <div className="whitespace-pre-wrap p-4">{longText}</div>
    </ScrollShadow>
  ),
};

export const OffsetShadow: Story = {
  render: () => (
    <ScrollShadow offset={100} className="w-[300px] h-[200px]">
      <div className="whitespace-pre-wrap p-4">{longText}</div>
    </ScrollShadow>
  ),
};
