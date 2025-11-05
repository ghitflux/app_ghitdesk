import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '@heroui/calendar';
import { CalendarDate } from '@internationalized/date';

const meta: Meta<typeof Calendar> = {
  title: 'HeroUI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Date selector',
  },
};

export const WithDefaultValue: Story = {
  args: {
    'aria-label': 'Date selector',
    defaultValue: new CalendarDate(2024, 11, 15),
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Calendar aria-label="Primary" color="primary" />
      <Calendar aria-label="Secondary" color="secondary" />
      <Calendar aria-label="Success" color="success" />
      <Calendar aria-label="Warning" color="warning" />
      <Calendar aria-label="Danger" color="danger" />
    </div>
  ),
};

export const DisabledDates: Story = {
  render: () => (
    <Calendar
      aria-label="Disabled dates"
      isDateUnavailable={(date) => {
        // Disable weekends
        const day = date.toDate('UTC').getDay();
        return day === 0 || day === 6;
      }}
    />
  ),
};

export const ReadOnly: Story = {
  args: {
    'aria-label': 'Read only calendar',
    isReadOnly: true,
    defaultValue: new CalendarDate(2024, 11, 15),
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled calendar',
    isDisabled: true,
    defaultValue: new CalendarDate(2024, 11, 15),
  },
};

export const WithFooter: Story = {
  render: () => (
    <div>
      <Calendar aria-label="Calendar with footer" />
      <div className="mt-2 text-center text-sm text-default-500">
        Select a date for your appointment
      </div>
    </div>
  ),
};

export const EventScheduler: Story = {
  render: () => (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold mb-2">Schedule Event</h3>
      <Calendar
        aria-label="Event date"
        color="primary"
        isDateUnavailable={(date) => {
          const day = date.toDate('UTC').getDay();
          return day === 0 || day === 6;
        }}
      />
      <p className="mt-2 text-sm text-default-500">
        Weekends are unavailable for scheduling
      </p>
    </div>
  ),
};
