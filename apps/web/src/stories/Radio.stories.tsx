import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioGroup } from '@heroui/radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'HeroUI/Radio',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup label="Select your favorite pet">
      <Radio value="cat">Cat</Radio>
      <Radio value="dog">Dog</Radio>
      <Radio value="bird">Bird</Radio>
    </RadioGroup>
  ),
};

export const DefaultValue: Story = {
  render: () => (
    <RadioGroup label="Select priority" defaultValue="medium">
      <Radio value="low">Low</Radio>
      <Radio value="medium">Medium</Radio>
      <Radio value="high">High</Radio>
      <Radio value="urgent">Urgent</Radio>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup label="Select status" orientation="horizontal">
      <Radio value="open">Open</Radio>
      <Radio value="in_progress">In Progress</Radio>
      <Radio value="resolved">Resolved</Radio>
      <Radio value="closed">Closed</Radio>
    </RadioGroup>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <RadioGroup label="Default" color="default" defaultValue="1">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
      <RadioGroup label="Primary" color="primary" defaultValue="1">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
      <RadioGroup label="Success" color="success" defaultValue="1">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
      <RadioGroup label="Warning" color="warning" defaultValue="1">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
      <RadioGroup label="Danger" color="danger" defaultValue="1">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <RadioGroup label="Small" size="sm" defaultValue="1">
        <Radio value="1">Small option</Radio>
        <Radio value="2">Small option</Radio>
      </RadioGroup>
      <RadioGroup label="Medium" size="md" defaultValue="1">
        <Radio value="1">Medium option</Radio>
        <Radio value="2">Medium option</Radio>
      </RadioGroup>
      <RadioGroup label="Large" size="lg" defaultValue="1">
        <Radio value="1">Large option</Radio>
        <Radio value="2">Large option</Radio>
      </RadioGroup>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <RadioGroup label="Select a plan" description="Choose the plan that fits your needs">
      <Radio value="free" description="Basic features">
        Free Plan
      </Radio>
      <Radio value="pro" description="Advanced features + support">
        Pro Plan - $9/mo
      </Radio>
      <Radio value="enterprise" description="Custom solutions">
        Enterprise Plan
      </Radio>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup label="Select option" defaultValue="1">
      <Radio value="1">Available</Radio>
      <Radio value="2" isDisabled>
        Disabled option
      </Radio>
      <Radio value="3">Available</Radio>
    </RadioGroup>
  ),
};

export const Invalid: Story = {
  render: () => (
    <RadioGroup
      label="Terms and Conditions"
      isInvalid
      errorMessage="You must accept the terms and conditions"
    >
      <Radio value="accept">I accept the terms</Radio>
      <Radio value="decline">I decline</Radio>
    </RadioGroup>
  ),
};

export const Required: Story = {
  render: () => (
    <RadioGroup label="Select your role" isRequired>
      <Radio value="admin">Administrator</Radio>
      <Radio value="supervisor">Supervisor</Radio>
      <Radio value="agent">Agent</Radio>
    </RadioGroup>
  ),
};
