import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table';
import { Chip } from '@heroui/chip';

const meta: Meta<typeof Table> = {
  title: 'HeroUI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const users = [
  { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Maria Santos', email: 'maria@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Pedro Costa', email: 'pedro@example.com', role: 'User', status: 'inactive' },
  { id: 4, name: 'Ana Oliveira', email: 'ana@example.com', role: 'Manager', status: 'active' },
];

export const Default: Story = {
  render: () => (
    <Table aria-label="Example table">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>ROLE</TableColumn>
        <TableColumn>STATUS</TableColumn>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Chip
                color={user.status === 'active' ? 'success' : 'default'}
                size="sm"
                variant="flat"
              >
                {user.status}
              </Chip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Striped: Story = {
  render: () => (
    <Table aria-label="Striped table" isStriped>
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>ROLE</TableColumn>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Compact: Story = {
  render: () => (
    <Table aria-label="Compact table">
      <TableHeader>
        <TableColumn>ID</TableColumn>
        <TableColumn>NAME</TableColumn>
        <TableColumn>STATUS</TableColumn>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>
              <Chip
                color={user.status === 'active' ? 'success' : 'default'}
                size="sm"
              >
                {user.status}
              </Chip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
