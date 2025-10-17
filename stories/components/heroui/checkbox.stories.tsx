import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox, CheckboxGroup } from '@heroui/react';

const meta = {
  title: 'HeroUI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Aceitar termos de serviço',
  },
};

export const Checked: Story = {
  args: {
    children: 'Notificações ativadas',
    defaultSelected: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Recurso indisponível',
    isDisabled: true,
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox color="default">Default</Checkbox>
      <Checkbox color="primary">Primary</Checkbox>
      <Checkbox color="secondary">Secondary</Checkbox>
      <Checkbox color="success">Success</Checkbox>
      <Checkbox color="warning">Warning</Checkbox>
      <Checkbox color="danger">Danger</Checkbox>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox size="sm">Small</Checkbox>
      <Checkbox size="md">Medium</Checkbox>
      <Checkbox size="lg">Large</Checkbox>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <CheckboxGroup
      label="Canais de notificação"
      color="primary"
      defaultValue={['whatsapp', 'email']}
    >
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="whatsapp">WhatsApp</Checkbox>
      <Checkbox value="sms">SMS</Checkbox>
      <Checkbox value="push">Notificação push</Checkbox>
    </CheckboxGroup>
  ),
};

export const GhitDeskUseCases: Story = {
  render: () => (
    <div className="space-y-6">
      <CheckboxGroup
        label="Filtrar por Status"
        color="primary"
        orientation="horizontal"
      >
        <Checkbox value="open">Aberto</Checkbox>
        <Checkbox value="in_progress">Em Andamento</Checkbox>
        <Checkbox value="resolved">Resolvido</Checkbox>
      </CheckboxGroup>

      <CheckboxGroup
        label="Canais"
        description="Selecione os canais para filtrar"
      >
        <Checkbox value="whatsapp">WhatsApp</Checkbox>
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="telegram">Telegram</Checkbox>
      </CheckboxGroup>

      <Checkbox color="success">Marcar como urgente</Checkbox>
      <Checkbox color="primary">Atribuir para mim</Checkbox>
    </div>
  ),
};
