import type { Meta, StoryObj } from '@storybook/react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { useState } from 'react';

const meta: Meta<typeof Navbar> = {
  title: 'HeroUI/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">GHITDESK</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  ),
};

export const WithMenu: Story = {
  render: () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuItems = [
      'Dashboard',
      'Tickets',
      'Conversations',
      'Reports',
      'Settings',
      'Log Out',
    ];

    return (
      <Navbar onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden"
          />
          <NavbarBrand>
            <p className="font-bold text-inherit">GHITDESK</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Dashboard
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link href="#" aria-current="page" color="primary">
              Tickets
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Reports
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="flat">
              Sign Up
            </Button>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? 'primary'
                    : index === menuItems.length - 1
                      ? 'danger'
                      : 'foreground'
                }
                className="w-full"
                href="#"
                size="lg"
              >
                {item}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    );
  },
};

export const Sticky: Story = {
  render: () => (
    <div className="h-screen overflow-auto">
      <Navbar isBordered position="sticky">
        <NavbarBrand>
          <p className="font-bold text-inherit">GHITDESK</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link href="#" aria-current="page">
              Customers
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Integrations
            </Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Content Area</h1>
        {Array.from({ length: 50 }).map((_, i) => (
          <p key={i} className="mb-2">
            Scroll to see sticky navbar behavior. Line {i + 1}
          </p>
        ))}
      </div>
    </div>
  ),
};

export const WithSearch: Story = {
  render: () => (
    <Navbar isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">GHITDESK</p>
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page" color="primary">
            Tickets
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Reports
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button color="primary" variant="flat">
            Profile
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Navbar>
        <NavbarBrand>
          <p className="font-bold">Default</p>
        </NavbarBrand>
      </Navbar>
      <Navbar isBordered>
        <NavbarBrand>
          <p className="font-bold">Bordered</p>
        </NavbarBrand>
      </Navbar>
      <Navbar isBlurred>
        <NavbarBrand>
          <p className="font-bold">Blurred</p>
        </NavbarBrand>
      </Navbar>
    </div>
  ),
};
