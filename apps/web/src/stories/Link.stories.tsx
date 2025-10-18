import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '@heroui/link';
import { ExternalLink } from 'lucide-react';

const meta: Meta<typeof Link> = {
  title: 'HeroUI/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: '#',
    children: 'Default Link',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link href="#" color="foreground">Foreground</Link>
      <Link href="#" color="primary">Primary</Link>
      <Link href="#" color="secondary">Secondary</Link>
      <Link href="#" color="success">Success</Link>
      <Link href="#" color="warning">Warning</Link>
      <Link href="#" color="danger">Danger</Link>
    </div>
  ),
};

export const Underline: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link href="#" underline="none">No Underline</Link>
      <Link href="#" underline="hover">Underline on Hover</Link>
      <Link href="#" underline="always">Always Underlined</Link>
      <Link href="#" underline="active">Underline when Active</Link>
      <Link href="#" underline="focus">Underline on Focus</Link>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link
        href="#"
        color="primary"
        showAnchorIcon
      >
        Link with anchor icon
      </Link>
      <Link
        href="#"
        color="success"
        isExternal
      >
        External Link <ExternalLink size={14} className="ml-1 inline" />
      </Link>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    href: '#',
    isDisabled: true,
    children: 'Disabled Link',
  },
};

export const Block: Story = {
  args: {
    href: '#',
    isBlock: true,
    color: 'primary',
    showAnchorIcon: true,
    children: 'Block Link (takes full width)',
  },
};
