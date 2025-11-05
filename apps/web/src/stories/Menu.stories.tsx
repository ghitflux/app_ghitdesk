import type { Meta, StoryObj } from '@storybook/react';
import { Menu, MenuItem, MenuSection } from '@heroui/menu';
import {
  User,
  Settings,
  LogOut,
  Copy,
  Edit,
  Delete,
  FileText,
  Archive,
  Share2,
} from 'lucide-react';

const meta: Meta<typeof Menu> = {
  title: 'HeroUI/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menu aria-label="Example Menu" className="w-64">
      <MenuItem key="new">New File</MenuItem>
      <MenuItem key="copy">Copy</MenuItem>
      <MenuItem key="edit">Edit</MenuItem>
      <MenuItem key="delete">Delete</MenuItem>
    </Menu>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Menu aria-label="Menu with icons" className="w-64">
      <MenuItem key="copy" startContent={<Copy size={16} />}>
        Copy
      </MenuItem>
      <MenuItem key="edit" startContent={<Edit size={16} />}>
        Edit
      </MenuItem>
      <MenuItem key="delete" startContent={<Delete size={16} />} color="danger">
        Delete
      </MenuItem>
    </Menu>
  ),
};

export const WithSections: Story = {
  render: () => (
    <Menu aria-label="Menu with sections" className="w-64">
      <MenuSection title="Account">
        <MenuItem key="profile" startContent={<User size={16} />}>
          Profile
        </MenuItem>
        <MenuItem key="settings" startContent={<Settings size={16} />}>
          Settings
        </MenuItem>
      </MenuSection>
      <MenuSection title="Actions">
        <MenuItem key="copy" startContent={<Copy size={16} />}>
          Copy
        </MenuItem>
        <MenuItem key="share" startContent={<Share2 size={16} />}>
          Share
        </MenuItem>
      </MenuSection>
      <MenuSection title="Danger Zone">
        <MenuItem key="logout" startContent={<LogOut size={16} />} color="danger">
          Logout
        </MenuItem>
      </MenuSection>
    </Menu>
  ),
};

export const TicketActions: Story = {
  render: () => (
    <Menu aria-label="Ticket actions" className="w-64">
      <MenuSection title="Ticket Actions">
        <MenuItem key="view" startContent={<FileText size={16} />}>
          View Details
        </MenuItem>
        <MenuItem key="edit" startContent={<Edit size={16} />}>
          Edit Ticket
        </MenuItem>
        <MenuItem key="copy" startContent={<Copy size={16} />}>
          Duplicate
        </MenuItem>
      </MenuSection>
      <MenuSection title="Status">
        <MenuItem key="archive" startContent={<Archive size={16} />}>
          Archive
        </MenuItem>
        <MenuItem key="delete" startContent={<Delete size={16} />} color="danger">
          Delete Ticket
        </MenuItem>
      </MenuSection>
    </Menu>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Menu aria-label="Menu with descriptions" className="w-64">
      <MenuItem
        key="new"
        description="Create a new ticket"
        startContent={<FileText size={16} />}
      >
        New Ticket
      </MenuItem>
      <MenuItem
        key="copy"
        description="Duplicate this ticket"
        startContent={<Copy size={16} />}
      >
        Duplicate
      </MenuItem>
      <MenuItem
        key="archive"
        description="Move to archive"
        startContent={<Archive size={16} />}
      >
        Archive
      </MenuItem>
    </Menu>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Menu aria-label="Flat variant" variant="flat" className="w-48">
        <MenuItem key="1">Flat</MenuItem>
        <MenuItem key="2">Menu</MenuItem>
        <MenuItem key="3">Variant</MenuItem>
      </Menu>
      <Menu aria-label="Bordered variant" variant="bordered" className="w-48">
        <MenuItem key="1">Bordered</MenuItem>
        <MenuItem key="2">Menu</MenuItem>
        <MenuItem key="3">Variant</MenuItem>
      </Menu>
      <Menu aria-label="Shadow variant" variant="shadow" className="w-48">
        <MenuItem key="1">Shadow</MenuItem>
        <MenuItem key="2">Menu</MenuItem>
        <MenuItem key="3">Variant</MenuItem>
      </Menu>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <Menu aria-label="Menu with colors" className="w-64">
      <MenuItem key="default" color="default">
        Default
      </MenuItem>
      <MenuItem key="primary" color="primary">
        Primary
      </MenuItem>
      <MenuItem key="secondary" color="secondary">
        Secondary
      </MenuItem>
      <MenuItem key="success" color="success">
        Success
      </MenuItem>
      <MenuItem key="warning" color="warning">
        Warning
      </MenuItem>
      <MenuItem key="danger" color="danger">
        Danger
      </MenuItem>
    </Menu>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Menu aria-label="Menu with disabled items" className="w-64">
      <MenuItem key="copy" startContent={<Copy size={16} />}>
        Copy
      </MenuItem>
      <MenuItem key="edit" startContent={<Edit size={16} />} isDisabled>
        Edit (disabled)
      </MenuItem>
      <MenuItem key="delete" startContent={<Delete size={16} />}>
        Delete
      </MenuItem>
    </Menu>
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <Menu aria-label="Menu with shortcuts" className="w-64">
      <MenuItem
        key="copy"
        startContent={<Copy size={16} />}
        endContent={<span className="text-xs text-default-400">⌘C</span>}
      >
        Copy
      </MenuItem>
      <MenuItem
        key="edit"
        startContent={<Edit size={16} />}
        endContent={<span className="text-xs text-default-400">⌘E</span>}
      >
        Edit
      </MenuItem>
      <MenuItem
        key="delete"
        startContent={<Delete size={16} />}
        endContent={<span className="text-xs text-default-400">⌘⌫</span>}
        color="danger"
      >
        Delete
      </MenuItem>
    </Menu>
  ),
};

export const SingleSelection: Story = {
  render: () => (
    <Menu
      aria-label="Single selection menu"
      selectionMode="single"
      defaultSelectedKeys={['read']}
      className="w-64"
    >
      <MenuItem key="read">Mark as Read</MenuItem>
      <MenuItem key="unread">Mark as Unread</MenuItem>
      <MenuItem key="archive">Archive</MenuItem>
    </Menu>
  ),
};

export const MultipleSelection: Story = {
  render: () => (
    <Menu
      aria-label="Multiple selection menu"
      selectionMode="multiple"
      defaultSelectedKeys={['urgent', 'unread']}
      className="w-64"
    >
      <MenuSection title="Filters">
        <MenuItem key="urgent">Urgent</MenuItem>
        <MenuItem key="high">High Priority</MenuItem>
        <MenuItem key="unread">Unread</MenuItem>
        <MenuItem key="assigned">Assigned to Me</MenuItem>
      </MenuSection>
    </Menu>
  ),
};
