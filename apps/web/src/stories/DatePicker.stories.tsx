import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from '@heroui/date-picker';
import { CalendarDate } from '@internationalized/date';

const meta: Meta<typeof DatePicker> = {
  title: 'HeroUI/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select Date',
    className: 'max-w-xs',
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Meeting Date',
    defaultValue: new CalendarDate(2024, 11, 15),
    className: 'max-w-xs',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DatePicker label="Flat" variant="flat" />
      <DatePicker label="Bordered" variant="bordered" />
      <DatePicker label="Underlined" variant="underlined" />
      <DatePicker label="Faded" variant="faded" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DatePicker label="Small" size="sm" />
      <DatePicker label="Medium" size="md" />
      <DatePicker label="Large" size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DatePicker label="Default" color="default" />
      <DatePicker label="Primary" color="primary" />
      <DatePicker label="Secondary" color="secondary" />
      <DatePicker label="Success" color="success" />
      <DatePicker label="Warning" color="warning" />
      <DatePicker label="Danger" color="danger" />
    </div>
  ),
};

export const Required: Story = {
  args: {
    label: 'Required Date',
    isRequired: true,
    className: 'max-w-xs',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Picker',
    isDisabled: true,
    defaultValue: new CalendarDate(2024, 11, 15),
    className: 'max-w-xs',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Appointment',
    description: 'Select your preferred date',
    className: 'max-w-xs',
  },
};

export const Invalid: Story = {
  args: {
    label: 'Invalid Picker',
    isInvalid: true,
    errorMessage: 'This date is not available',
    className: 'max-w-xs',
  },
};

export const ReportRange: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DatePicker
        label="Start Date"
        description="Select report start date"
      />
      <DatePicker
        label="End Date"
        description="Select report end date"
      />
    </div>
  ),
};

export const SLADeadline: Story = {
  args: {
    label: 'SLA Deadline',
    description: 'Target resolution date',
    color: 'warning',
    isRequired: true,
    className: 'max-w-xs',
  },
};
