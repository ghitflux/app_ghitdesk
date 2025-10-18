import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';

const meta: Meta<typeof Card> = {
  title: 'HeroUI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">HeroUI</p>
          <p className="text-small text-default-500">heroui.com</p>
        </div>
      </CardHeader>
      <CardBody>
        <p>Beautiful, fast and modern React UI library.</p>
      </CardBody>
      <CardFooter>
        <Button color="primary">Visit</Button>
      </CardFooter>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Card className="w-64">
        <CardHeader>
          <p className="text-md font-semibold">Shadow (default)</p>
        </CardHeader>
        <CardBody>
          <p>Card with shadow variant</p>
        </CardBody>
      </Card>

      <Card className="w-64" variant="bordered">
        <CardHeader>
          <p className="text-md font-semibold">Bordered</p>
        </CardHeader>
        <CardBody>
          <p>Card with bordered variant</p>
        </CardBody>
      </Card>

      <Card className="w-64" variant="flat">
        <CardHeader>
          <p className="text-md font-semibold">Flat</p>
        </CardHeader>
        <CardBody>
          <p>Card with flat variant</p>
        </CardBody>
      </Card>
    </div>
  ),
};
