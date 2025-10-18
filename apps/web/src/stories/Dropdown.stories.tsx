import type { Meta, StoryObj } from '@storybook/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from '@heroui/dropdown';
import { Button } from '@heroui/button';
import { Settings, User, LogOut, Edit, Delete, Copy } from 'lucide-react';

const meta: Meta<typeof Dropdown> = {
  title: 'HeroUI/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>
        <Button color="primary">Open Menu</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="new">New file</DropdownItem>
        <DropdownItem key="copy">Copy link</DropdownItem>
        <DropdownItem key="edit">Edit file</DropdownItem>
        <DropdownItem key="delete" className="text-danger" color="danger">
          Delete file
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>
        <Button color="primary" startContent={<Settings size={18} />}>
          Actions
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Actions with icons">
        <DropdownItem key="edit" startContent={<Edit size={16} />}>
          Edit
        </DropdownItem>
        <DropdownItem key="copy" startContent={<Copy size={16} />}>
          Copy
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Delete size={16} />}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};

export const WithSections: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">User Menu</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu with sections">
        <DropdownSection title="Profile" showDivider>
          <DropdownItem key="profile" startContent={<User size={16} />}>
            Profile
          </DropdownItem>
          <DropdownItem key="settings" startContent={<Settings size={16} />}>
            Settings
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title="Actions">
          <DropdownItem
            key="logout"
            color="danger"
            startContent={<LogOut size={16} />}
          >
            Logout
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>
        <Button color="primary">Actions</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Menu with disabled items">
        <DropdownItem key="new">New file</DropdownItem>
        <DropdownItem key="copy" isDisabled>
          Copy (disabled)
        </DropdownItem>
        <DropdownItem key="edit">Edit file</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};
