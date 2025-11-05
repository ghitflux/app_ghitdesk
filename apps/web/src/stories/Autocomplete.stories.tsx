import type { Meta, StoryObj } from '@storybook/react';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import { useState } from 'react';

const meta: Meta<typeof Autocomplete> = {
  title: 'HeroUI/Autocomplete',
  component: Autocomplete,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const animals = [
  { label: 'Cat', value: 'cat', description: 'The second most popular pet in the world' },
  { label: 'Dog', value: 'dog', description: 'The most popular pet in the world' },
  { label: 'Elephant', value: 'elephant', description: 'The largest land animal' },
  { label: 'Lion', value: 'lion', description: 'The king of the jungle' },
  { label: 'Tiger', value: 'tiger', description: 'The largest cat species' },
  { label: 'Giraffe', value: 'giraffe', description: 'The tallest land animal' },
  { label: 'Dolphin', value: 'dolphin', description: 'A widely distributed aquatic mammal' },
  { label: 'Penguin', value: 'penguin', description: 'A group of aquatic flightless birds' },
  { label: 'Zebra', value: 'zebra', description: 'A wild horse with black and white stripes' },
  { label: 'Shark', value: 'shark', description: 'A group of fish characterized by a cartilaginous skeleton' },
];

const users = [
  { label: 'João Silva', value: 'joao', description: 'Agent - Online' },
  { label: 'Maria Santos', value: 'maria', description: 'Agent - Busy' },
  { label: 'Pedro Costa', value: 'pedro', description: 'Supervisor - Online' },
  { label: 'Ana Oliveira', value: 'ana', description: 'Agent - Away' },
  { label: 'Carlos Souza', value: 'carlos', description: 'Admin - Online' },
];

export const Default: Story = {
  render: () => (
    <Autocomplete
      label="Select an animal"
      className="max-w-xs"
      defaultItems={animals}
    >
      {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
    </Autocomplete>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Autocomplete
      label="Favorite Animal"
      placeholder="Search an animal"
      className="max-w-xs"
      defaultItems={animals}
    >
      {(item) => (
        <AutocompleteItem key={item.value} description={item.description}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  ),
};

export const AssignTicket: Story = {
  render: () => (
    <Autocomplete
      label="Assign to Agent"
      placeholder="Search agents..."
      className="max-w-xs"
      defaultItems={users}
    >
      {(item) => (
        <AutocompleteItem key={item.value} description={item.description}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="flex flex-col gap-2">
        <Autocomplete
          label="Select an animal"
          placeholder="Type to search..."
          className="max-w-xs"
          inputValue={value}
          onInputChange={setValue}
          defaultItems={animals}
        >
          {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
        </Autocomplete>
        <p className="text-small text-default-500">
          Current input value: {value || '(empty)'}
        </p>
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Autocomplete
        label="Flat"
        variant="flat"
        placeholder="Search..."
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
      <Autocomplete
        label="Bordered"
        variant="bordered"
        placeholder="Search..."
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
      <Autocomplete
        label="Underlined"
        variant="underlined"
        placeholder="Search..."
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
      <Autocomplete
        label="Faded"
        variant="faded"
        placeholder="Search..."
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Autocomplete
        label="Small"
        size="sm"
        placeholder="Search..."
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
      <Autocomplete
        label="Medium"
        size="md"
        placeholder="Search..."
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
      <Autocomplete
        label="Large"
        size="lg"
        placeholder="Search..."
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <Autocomplete
      label="Assign Ticket"
      placeholder="Select an agent"
      className="max-w-xs"
      isRequired
      defaultItems={users}
    >
      {(item) => (
        <AutocompleteItem key={item.value} description={item.description}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Autocomplete
      label="Disabled Autocomplete"
      placeholder="Search..."
      className="max-w-xs"
      isDisabled
      defaultItems={animals}
    >
      {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
    </Autocomplete>
  ),
};

export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const isInvalid = value !== '' && !animals.some((a) => a.label.toLowerCase().includes(value.toLowerCase()));

    return (
      <Autocomplete
        label="Search Animal"
        placeholder="Type to search..."
        className="max-w-xs"
        inputValue={value}
        onInputChange={setValue}
        isInvalid={isInvalid}
        errorMessage={isInvalid && 'Please select a valid animal'}
        defaultItems={animals}
      >
        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
      </Autocomplete>
    );
  },
};
