import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox, CheckboxGroup } from '@heroui/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'HeroUI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Agree to terms and conditions',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox color="default">Default</Checkbox>
      <Checkbox color="primary">Primary</Checkbox>
      <Checkbox color="secondary">Secondary</Checkbox>
      <Checkbox color="success">Success</Checkbox>
      <Checkbox color="warning">Warning</Checkbox>
      <Checkbox color="danger">Danger</Checkbox>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <CheckboxGroup label="Select options" color="primary" defaultValue={['option1']}>
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
      <Checkbox value="option4">Option 4</Checkbox>
    </CheckboxGroup>
  ),
};
