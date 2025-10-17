import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@heroui/react';
import { ShoppingCart, Trash2, Download, Plus, ArrowRight } from 'lucide-react';

const meta = {
  title: 'HeroUI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    color: 'primary',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button color="default">Default</Button>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="solid" color="primary">Solid</Button>
      <Button variant="bordered" color="primary">Bordered</Button>
      <Button variant="flat" color="primary">Flat</Button>
      <Button variant="faded" color="primary">Faded</Button>
      <Button variant="shadow" color="primary">Shadow</Button>
      <Button variant="ghost" color="primary">Ghost</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <Button size="sm" color="primary">Small</Button>
      <Button size="md" color="primary">Medium</Button>
      <Button size="lg" color="primary">Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button startContent={<Plus size={18} />} color="primary">
        Novo
      </Button>
      <Button endContent={<Download size={18} />} color="success">
        Download
      </Button>
      <Button startContent={<ArrowRight size={18} />} endContent={<ArrowRight size={18} />}>
        Continuar
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button isIconOnly color="primary">
        <Plus size={18} />
      </Button>
      <Button isIconOnly color="success" variant="flat">
        <Download size={18} />
      </Button>
      <Button isIconOnly color="danger" variant="bordered">
        <Trash2 size={18} />
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button color="primary">Normal</Button>
      <Button color="primary" isLoading>Loading</Button>
      <Button color="primary" isDisabled>Disabled</Button>
    </div>
  ),
};

export const GhitDeskUseCases: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button color="primary" startContent={<Plus size={18} />}>
          Criar Ticket
        </Button>
        <Button color="success">Resolver</Button>
        <Button color="danger" variant="flat">Fechar</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="bordered">Filtrar</Button>
        <Button variant="bordered" startContent={<Download size={18} />}>
          Exportar
        </Button>
        <Button variant="ghost">Cancelar</Button>
      </div>
    </div>
  ),
};
