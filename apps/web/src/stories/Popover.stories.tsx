import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverTrigger, PopoverContent, Button, Input } from '@heroui/react';
import { User, Settings } from 'lucide-react';

const meta: Meta<typeof Popover> = {
  title: 'HeroUI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button>Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">Popover Content</div>
          <div className="text-tiny">This is the popover content</div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Popover placement="top">
        <PopoverTrigger>
          <Button>Top</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">Top placement</div>
        </PopoverContent>
      </Popover>

      <Popover placement="bottom">
        <PopoverTrigger>
          <Button>Bottom</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">Bottom placement</div>
        </PopoverContent>
      </Popover>

      <Popover placement="left">
        <PopoverTrigger>
          <Button>Left</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">Left placement</div>
        </PopoverContent>
      </Popover>

      <Popover placement="right">
        <PopoverTrigger>
          <Button>Right</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">Right placement</div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <Popover showArrow>
      <PopoverTrigger>
        <Button>With Arrow</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">Tooltip with Arrow</div>
          <div className="text-tiny">This popover has an arrow pointer</div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const UserInfo: Story = {
  render: () => (
    <Popover placement="bottom" showArrow>
      <PopoverTrigger>
        <Button startContent={<User size={18} />}>User Info</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-4 py-3 w-64">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              JS
            </div>
            <div>
              <p className="text-sm font-semibold">João Silva</p>
              <p className="text-xs text-default-500">Agent</p>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <p>Email: joao@ghitdesk.com</p>
            <p>Status: Online</p>
            <p>Active Tickets: 5</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button>Edit Profile</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-4 py-3 w-80">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Update Profile</h3>
          </div>
          <div className="space-y-3">
            <Input size="sm" label="Name" defaultValue="João Silva" />
            <Input
              size="sm"
              label="Email"
              type="email"
              defaultValue="joao@ghitdesk.com"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="flat">
                Cancel
              </Button>
              <Button size="sm" color="primary">
                Save
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithBackdrop: Story = {
  render: () => (
    <Popover backdrop="blur">
      <PopoverTrigger>
        <Button>Open with Backdrop</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-4 py-3">
          <div className="text-small font-bold mb-2">Important Message</div>
          <div className="text-tiny">
            This popover has a blur backdrop. Click outside to close.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const ContextMenu: Story = {
  render: () => (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button startContent={<Settings size={18} />}>Actions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-48">
          <div className="px-3 py-2 hover:bg-default-100 cursor-pointer rounded flex items-center gap-2">
            <User size={16} />
            <span className="text-sm">View Profile</span>
          </div>
          <div className="px-3 py-2 hover:bg-default-100 cursor-pointer rounded flex items-center gap-2">
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </div>
          <div className="border-t border-default-200 my-1"></div>
          <div className="px-3 py-2 hover:bg-danger-50 cursor-pointer rounded flex items-center gap-2 text-danger">
            <span className="text-sm">Delete</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
