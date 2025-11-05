import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@heroui/slider';
import { useState } from 'react';

const meta: Meta<typeof Slider> = {
  title: 'HeroUI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Volume',
    defaultValue: 50,
    className: 'max-w-md',
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState(30);

    return (
      <div className="flex flex-col gap-2 w-full max-w-md">
        <Slider
          label="Temperature"
          value={value}
          onChange={(val) => setValue(val as number)}
          minValue={0}
          maxValue={100}
        />
        <p className="text-sm text-default-500">Selected: {value}°C</p>
      </div>
    );
  },
};

export const Range: Story = {
  render: () => {
    const [value, setValue] = useState([20, 80]);

    return (
      <div className="flex flex-col gap-2 w-full max-w-md">
        <Slider
          label="Price Range"
          value={value}
          onChange={(val) => setValue(val as number[])}
          minValue={0}
          maxValue={100}
        />
        <p className="text-sm text-default-500">
          Range: ${value[0]} - ${value[1]}
        </p>
      </div>
    );
  },
};

export const Steps: Story = {
  args: {
    label: 'Priority Level',
    step: 25,
    minValue: 0,
    maxValue: 100,
    defaultValue: 50,
    marks: [
      { value: 0, label: 'Low' },
      { value: 25, label: 'Med' },
      { value: 50, label: 'High' },
      { value: 75, label: 'Urgent' },
      { value: 100, label: 'Critical' },
    ],
    className: 'max-w-md',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Slider label="Default" color="default" defaultValue={40} />
      <Slider label="Primary" color="primary" defaultValue={50} />
      <Slider label="Secondary" color="secondary" defaultValue={60} />
      <Slider label="Success" color="success" defaultValue={70} />
      <Slider label="Warning" color="warning" defaultValue={80} />
      <Slider label="Danger" color="danger" defaultValue={90} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Slider label="Small" size="sm" defaultValue={30} />
      <Slider label="Medium" size="md" defaultValue={50} />
      <Slider label="Large" size="lg" defaultValue={70} />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex gap-4 h-64">
      <Slider
        label="Volume"
        orientation="vertical"
        defaultValue={50}
        className="h-full"
      />
      <Slider
        label="Bass"
        orientation="vertical"
        defaultValue={30}
        color="success"
        className="h-full"
      />
      <Slider
        label="Treble"
        orientation="vertical"
        defaultValue={70}
        color="warning"
        className="h-full"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Slider',
    defaultValue: 50,
    isDisabled: true,
    className: 'max-w-md',
  },
};

export const WithTooltip: Story = {
  args: {
    label: 'Volume',
    defaultValue: 50,
    showTooltip: true,
    formatOptions: { style: 'percent' },
    className: 'max-w-md',
  },
};

export const CustomFormat: Story = {
  render: () => (
    <Slider
      label="File Size"
      minValue={0}
      maxValue={1000}
      defaultValue={500}
      showTooltip
      getValue={(value) => `${value} MB`}
      className="max-w-md"
    />
  ),
};
