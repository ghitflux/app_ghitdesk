import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@heroui/react';
import { Mail, Lock, Search, User } from 'lucide-react';

const meta = {
  title: 'HeroUI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Digite seu email',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Email',
    placeholder: 'Digite seu email',
    description: 'Enviaremos um código de verificação',
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    placeholder: 'Digite seu email',
    isRequired: true,
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Email"
        placeholder="email@example.com"
        startContent={<Mail size={18} className="text-default-400" />}
      />
      <Input
        type="password"
        label="Senha"
        placeholder="Digite sua senha"
        startContent={<Lock size={18} className="text-default-400" />}
      />
      <Input
        label="Buscar"
        placeholder="Buscar tickets..."
        startContent={<Search size={18} className="text-default-400" />}
      />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="Flat" variant="flat" placeholder="Variant flat" />
      <Input label="Bordered" variant="bordered" placeholder="Variant bordered" />
      <Input label="Faded" variant="faded" placeholder="Variant faded" />
      <Input label="Underlined" variant="underlined" placeholder="Variant underlined" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input size="md" label="Medium" placeholder="Medium input" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="Normal" placeholder="Normal state" />
      <Input label="Disabled" placeholder="Disabled state" isDisabled />
      <Input label="ReadOnly" placeholder="ReadOnly state" isReadOnly value="Read only value" />
      <Input
        label="Error"
        placeholder="Error state"
        isInvalid
        errorMessage="Este campo é obrigatório"
      />
    </div>
  ),
};

export const GhitDeskUseCases: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Input
        label="Título do Ticket"
        placeholder="Ex: Erro no login do sistema"
        isRequired
      />
      <Input
        label="Email do Cliente"
        type="email"
        placeholder="cliente@example.com"
        startContent={<Mail size={18} className="text-default-400" />}
      />
      <Input
        label="Buscar Conversas"
        placeholder="Buscar por cliente, assunto..."
        startContent={<Search size={18} className="text-default-400" />}
      />
      <Input
        label="Número do Ticket"
        placeholder="#TICKET-001"
        isReadOnly
        value="#TICKET-12345"
      />
    </div>
  ),
};
