import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/breadcrumbs';
import { Home, FileText, Settings } from 'lucide-react';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'HeroUI/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem>Home</BreadcrumbItem>
      <BreadcrumbItem>Tickets</BreadcrumbItem>
      <BreadcrumbItem>Details</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem startContent={<Home size={16} />}>Home</BreadcrumbItem>
      <BreadcrumbItem startContent={<FileText size={16} />}>
        Tickets
      </BreadcrumbItem>
      <BreadcrumbItem startContent={<Settings size={16} />}>
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs size="sm">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Small</BreadcrumbItem>
        <BreadcrumbItem>Size</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs size="md">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Medium</BreadcrumbItem>
        <BreadcrumbItem>Size</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs size="lg">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Large</BreadcrumbItem>
        <BreadcrumbItem>Size</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs variant="solid">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Solid</BreadcrumbItem>
        <BreadcrumbItem>Variant</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs variant="bordered">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Bordered</BreadcrumbItem>
        <BreadcrumbItem>Variant</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs variant="light">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Light</BreadcrumbItem>
        <BreadcrumbItem>Variant</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs color="foreground">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Foreground</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs color="primary">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Primary</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs color="secondary">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Secondary</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs color="success">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Success</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs color="warning">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Warning</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs color="danger">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Danger</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs separator="/">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Tickets</BreadcrumbItem>
        <BreadcrumbItem>Details</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs separator="-">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Tickets</BreadcrumbItem>
        <BreadcrumbItem>Details</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs separator="•">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Tickets</BreadcrumbItem>
        <BreadcrumbItem>Details</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem>Home</BreadcrumbItem>
      <BreadcrumbItem isDisabled>Disabled</BreadcrumbItem>
      <BreadcrumbItem>Current</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const TicketNavigation: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem startContent={<Home size={16} />}>Dashboard</BreadcrumbItem>
      <BreadcrumbItem>Tickets</BreadcrumbItem>
      <BreadcrumbItem>Open</BreadcrumbItem>
      <BreadcrumbItem>TKT-12345</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const MaxItems: Story = {
  render: () => (
    <Breadcrumbs maxItems={3}>
      <BreadcrumbItem>Home</BreadcrumbItem>
      <BreadcrumbItem>Dashboard</BreadcrumbItem>
      <BreadcrumbItem>Tickets</BreadcrumbItem>
      <BreadcrumbItem>Open</BreadcrumbItem>
      <BreadcrumbItem>High Priority</BreadcrumbItem>
      <BreadcrumbItem>TKT-12345</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const Underlined: Story = {
  render: () => (
    <Breadcrumbs underline="active">
      <BreadcrumbItem>Home</BreadcrumbItem>
      <BreadcrumbItem>Tickets</BreadcrumbItem>
      <BreadcrumbItem>Details</BreadcrumbItem>
    </Breadcrumbs>
  ),
};
