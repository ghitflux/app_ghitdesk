import type { Meta, StoryObj } from '@storybook/react';
import { DateInput } from '@heroui/date-input';
import { CalendarDate } from '@internationalized/date';

const meta: Meta<typeof DateInput> = {
  title: 'HeroUI/DateInput',
  component: DateInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Birth date',
    className: 'max-w-xs',
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Appointment Date',
    defaultValue: new CalendarDate(2024, 11, 15),
    className: 'max-w-xs',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DateInput label="Flat" variant="flat" />
      <DateInput label="Bordered" variant="bordered" />
      <DateInput label="Underlined" variant="underlined" />
      <DateInput label="Faded" variant="faded" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DateInput label="Small" size="sm" />
      <DateInput label="Medium" size="md" />
      <DateInput label="Large" size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DateInput label="Default" color="default" />
      <DateInput label="Primary" color="primary" />
      <DateInput label="Secondary" color="secondary" />
      <DateInput label="Success" color="success" />
      <DateInput label="Warning" color="warning" />
      <DateInput label="Danger" color="danger" />
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
    label: 'Disabled Date',
    isDisabled: true,
    defaultValue: new CalendarDate(2024, 11, 15),
    className: 'max-w-xs',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Event Date',
    description: 'Select the date for your event',
    className: 'max-w-xs',
  },
};

export const Invalid: Story = {
  args: {
    label: 'Invalid Date',
    isInvalid: true,
    errorMessage: 'Please select a valid date',
    className: 'max-w-xs',
  },
};

export const TicketDueDate: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <DateInput
        label="Due Date"
        description="When should this ticket be resolved?"
        isRequired
      />
      <DateInput
        label="Follow-up Date"
        description="Optional follow-up date"
      />
    </div>
  ),
};
