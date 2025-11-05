import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '@heroui/pagination';
import { useState } from 'react';

const meta: Meta<typeof Pagination> = {
  title: 'HeroUI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 10,
    initialPage: 1,
  },
};

export const Controlled: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-small text-default-500">Selected Page: {currentPage}</p>
        <Pagination
          total={10}
          color="secondary"
          page={currentPage}
          onChange={setCurrentPage}
        />
      </div>
    );
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Pagination total={5} initialPage={1} color="default" />
      <Pagination total={5} initialPage={1} color="primary" />
      <Pagination total={5} initialPage={1} color="secondary" />
      <Pagination total={5} initialPage={1} color="success" />
      <Pagination total={5} initialPage={1} color="warning" />
      <Pagination total={5} initialPage={1} color="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Pagination total={5} initialPage={1} size="sm" />
      <Pagination total={5} initialPage={1} size="md" />
      <Pagination total={5} initialPage={1} size="lg" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Pagination total={5} initialPage={1} variant="flat" />
      <Pagination total={5} initialPage={1} variant="bordered" />
      <Pagination total={5} initialPage={1} variant="light" />
      <Pagination total={5} initialPage={1} variant="faded" />
    </div>
  ),
};

export const WithControls: Story = {
  args: {
    total: 10,
    initialPage: 1,
    showControls: true,
    color: 'primary',
  },
};

export const Compact: Story = {
  args: {
    total: 10,
    initialPage: 1,
    isCompact: true,
    showControls: true,
    color: 'secondary',
  },
};

export const ManyPages: Story = {
  args: {
    total: 100,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
    showControls: true,
  },
};
