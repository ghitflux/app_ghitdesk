import type { Meta, StoryObj } from '@storybook/react';
import { Listbox, ListboxItem, ListboxSection } from '@heroui/listbox';
import { User, Settings, LogOut, Copy, Edit, Delete } from 'lucide-react';

const meta: Meta<typeof Listbox> = {
  title: 'HeroUI/Listbox',
  component: Listbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Listbox aria-label="Actions" className="w-64">
      <ListboxItem key="new">New file</ListboxItem>
      <ListboxItem key="copy">Copy link</ListboxItem>
      <ListboxItem key="edit">Edit file</ListboxItem>
      <ListboxItem key="delete" className="text-danger" color="danger">
        Delete file
      </ListboxItem>
    </Listbox>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Listbox aria-label="User Actions" className="w-64">
      <ListboxItem key="profile" startContent={<User size={18} />}>
        Profile
      </ListboxItem>
      <ListboxItem key="settings" startContent={<Settings size={18} />}>
        Settings
      </ListboxItem>
      <ListboxItem
        key="logout"
        startContent={<LogOut size={18} />}
        className="text-danger"
        color="danger"
      >
        Logout
      </ListboxItem>
    </Listbox>
  ),
};

export const WithSections: Story = {
  render: () => (
    <Listbox aria-label="Actions with sections" className="w-64">
      <ListboxSection title="Actions">
        <ListboxItem key="copy" startContent={<Copy size={18} />}>
          Copy
        </ListboxItem>
        <ListboxItem key="edit" startContent={<Edit size={18} />}>
          Edit
        </ListboxItem>
      </ListboxSection>
      <ListboxSection title="Danger zone">
        <ListboxItem
          key="delete"
          startContent={<Delete size={18} />}
          className="text-danger"
          color="danger"
        >
          Delete
        </ListboxItem>
      </ListboxSection>
    </Listbox>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Listbox aria-label="User menu" className="w-64">
      <ListboxItem
        key="profile"
        description="View your profile"
        startContent={<User size={18} />}
      >
        Profile
      </ListboxItem>
      <ListboxItem
        key="settings"
        description="Manage your account"
        startContent={<Settings size={18} />}
      >
        Settings
      </ListboxItem>
      <ListboxItem
        key="logout"
        description="Sign out of your account"
        startContent={<LogOut size={18} />}
        className="text-danger"
        color="danger"
      >
        Logout
      </ListboxItem>
    </Listbox>
  ),
};

export const SingleSelection: Story = {
  render: () => (
    <Listbox
      aria-label="Single selection"
      selectionMode="single"
      defaultSelectedKeys={['medium']}
      className="w-64"
    >
      <ListboxItem key="low">Low Priority</ListboxItem>
      <ListboxItem key="medium">Medium Priority</ListboxItem>
      <ListboxItem key="high">High Priority</ListboxItem>
      <ListboxItem key="urgent">Urgent Priority</ListboxItem>
    </Listbox>
  ),
};

export const MultipleSelection: Story = {
  render: () => (
    <Listbox
      aria-label="Multiple selection"
      selectionMode="multiple"
      defaultSelectedKeys={['open', 'in_progress']}
      className="w-64"
    >
      <ListboxItem key="open">Open</ListboxItem>
      <ListboxItem key="in_progress">In Progress</ListboxItem>
      <ListboxItem key="resolved">Resolved</ListboxItem>
      <ListboxItem key="closed">Closed</ListboxItem>
    </Listbox>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Listbox aria-label="Flat" variant="flat" className="w-48">
        <ListboxItem key="1">Flat</ListboxItem>
        <ListboxItem key="2">Variant</ListboxItem>
      </Listbox>
      <Listbox aria-label="Bordered" variant="bordered" className="w-48">
        <ListboxItem key="1">Bordered</ListboxItem>
        <ListboxItem key="2">Variant</ListboxItem>
      </Listbox>
      <Listbox aria-label="Faded" variant="faded" className="w-48">
        <ListboxItem key="1">Faded</ListboxItem>
        <ListboxItem key="2">Variant</ListboxItem>
      </Listbox>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <Listbox aria-label="Colors" className="w-64">
      <ListboxItem key="default" color="default">
        Default
      </ListboxItem>
      <ListboxItem key="primary" color="primary">
        Primary
      </ListboxItem>
      <ListboxItem key="secondary" color="secondary">
        Secondary
      </ListboxItem>
      <ListboxItem key="success" color="success">
        Success
      </ListboxItem>
      <ListboxItem key="warning" color="warning">
        Warning
      </ListboxItem>
      <ListboxItem key="danger" color="danger">
        Danger
      </ListboxItem>
    </Listbox>
  ),
};

export const DisabledItems: Story = {
  render: () => (
    <Listbox aria-label="With disabled items" className="w-64">
      <ListboxItem key="copy" startContent={<Copy size={18} />}>
        Copy
      </ListboxItem>
      <ListboxItem key="edit" startContent={<Edit size={18} />} isDisabled>
        Edit (disabled)
      </ListboxItem>
      <ListboxItem key="delete" startContent={<Delete size={18} />}>
        Delete
      </ListboxItem>
    </Listbox>
  ),
};
