import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectItem } from '@heroui/react';

const meta = {
  title: 'HeroUI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const priorities = [
  { key: 'low', label: 'Baixa' },
  { key: 'medium', label: 'Média' },
  { key: 'high', label: 'Alta' },
  { key: 'urgent', label: 'Urgente' },
];

const statuses = [
  { key: 'open', label: 'Aberto' },
  { key: 'in_progress', label: 'Em Andamento' },
  { key: 'resolved', label: 'Resolvido' },
  { key: 'closed', label: 'Fechado' },
];

const channels = [
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'twitter', label: 'Twitter' },
];

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Select label="Prioridade" placeholder="Selecione a prioridade">
        {priorities.map((priority) => (
          <SelectItem key={priority.key} value={priority.key}>
            {priority.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="w-80">
      <Select
        label="Status"
        placeholder="Selecione o status"
        description="Status atual do ticket"
      >
        {statuses.map((status) => (
          <SelectItem key={status.key} value={status.key}>
            {status.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-80">
      <Select
        label="Canal"
        placeholder="Selecione o canal"
        isRequired
      >
        {channels.map((channel) => (
          <SelectItem key={channel.key} value={channel.key}>
            {channel.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Select label="Flat" variant="flat" placeholder="Variant flat">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
      <Select label="Bordered" variant="bordered" placeholder="Variant bordered">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
      <Select label="Faded" variant="faded" placeholder="Variant faded">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
      <Select label="Underlined" variant="underlined" placeholder="Variant underlined">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Select size="sm" label="Small" placeholder="Small select">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
      <Select size="md" label="Medium" placeholder="Medium select">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
      <Select size="lg" label="Large" placeholder="Large select">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Select label="Normal" placeholder="Normal state">
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
      <Select label="Disabled" placeholder="Disabled state" isDisabled>
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
      <Select
        label="Error"
        placeholder="Error state"
        isInvalid
        errorMessage="Este campo é obrigatório"
      >
        {priorities.map((p) => (
          <SelectItem key={p.key}>{p.label}</SelectItem>
        ))}
      </Select>
    </div>
  ),
};

export const GhitDeskUseCases: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Select
        label="Prioridade do Ticket"
        placeholder="Selecione a prioridade"
        color="primary"
      >
        {priorities.map((priority) => (
          <SelectItem key={priority.key}>{priority.label}</SelectItem>
        ))}
      </Select>
      <Select
        label="Status"
        placeholder="Alterar status"
        description="Atualizar o status do ticket"
      >
        {statuses.map((status) => (
          <SelectItem key={status.key}>{status.label}</SelectItem>
        ))}
      </Select>
      <Select
        label="Filtrar por Canal"
        placeholder="Todos os canais"
      >
        {channels.map((channel) => (
          <SelectItem key={channel.key}>{channel.label}</SelectItem>
        ))}
      </Select>
    </div>
  ),
};
