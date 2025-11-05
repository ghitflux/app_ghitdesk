import type { Meta, StoryObj } from '@storybook/react';
import { Spacer, Card, CardBody } from '@heroui/react';

const meta: Meta<typeof Spacer> = {
  title: 'HeroUI/Spacer',
  component: Spacer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Card>
        <CardBody>
          <p>First Section</p>
          <Spacer y={4} />
          <p>Second Section</p>
        </CardBody>
      </Card>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Card>
        <CardBody>
          <p>Section 1</p>
          <Spacer y={1} />
          <p>Section 2 (y=1)</p>
          <Spacer y={2} />
          <p>Section 3 (y=2)</p>
          <Spacer y={4} />
          <p>Section 4 (y=4)</p>
          <Spacer y={8} />
          <p>Section 5 (y=8)</p>
        </CardBody>
      </Card>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="flex items-center">
      <span>Item 1</span>
      <Spacer x={1} />
      <span>Item 2</span>
      <Spacer x={2} />
      <span>Item 3</span>
      <Spacer x={4} />
      <span>Item 4</span>
    </div>
  ),
};

export const Combined: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Card>
        <CardBody>
          <div className="flex items-center">
            <span>Left</span>
            <Spacer x={4} />
            <span>Right</span>
          </div>
          <Spacer y={4} />
          <div className="flex items-center">
            <span>Bottom Left</span>
            <Spacer x={4} />
            <span>Bottom Right</span>
          </div>
        </CardBody>
      </Card>
    </div>
  ),
};

export const InForm: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-0">
      <input
        type="text"
        placeholder="Name"
        className="w-full px-3 py-2 border rounded"
      />
      <Spacer y={4} />
      <input
        type="email"
        placeholder="Email"
        className="w-full px-3 py-2 border rounded"
      />
      <Spacer y={4} />
      <button className="w-full px-3 py-2 bg-primary text-white rounded">
        Submit
      </button>
    </div>
  ),
};

export const ResponsiveSpacing: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Card>
        <CardBody>
          <h3 className="text-lg font-bold">Responsive Layout</h3>
          <Spacer y={2} className="md:hidden" />
          <Spacer y={4} className="hidden md:block" />
          <p>Content with responsive spacing</p>
        </CardBody>
      </Card>
    </div>
  ),
};
