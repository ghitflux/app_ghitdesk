import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter, Divider, Button, Chip } from '@heroui/react';
import { MessageCircle, Clock } from 'lucide-react';

const meta = {
  title: 'HeroUI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
      </CardHeader>
      <CardBody>
        <p className="text-default-600">
          This is a simple card with header and body content.
        </p>
      </CardBody>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card with Footer</h3>
      </CardHeader>
      <CardBody>
        <p className="text-default-600">
          This card includes a footer with action buttons.
        </p>
      </CardBody>
      <CardFooter className="gap-2">
        <Button color="primary" size="sm">Confirm</Button>
        <Button variant="flat" size="sm">Cancel</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithDivider: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">Card Title</h3>
          <p className="text-small text-default-500">Subtitle</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="text-default-600">
          Card content with divider for better visual separation.
        </p>
      </CardBody>
      <Divider />
      <CardFooter>
        <p className="text-small text-default-400">Last updated: 2 hours ago</p>
      </CardFooter>
    </Card>
  ),
};

export const Hoverable: Story = {
  render: () => (
    <Card className="w-96" isPressable isHoverable>
      <CardBody>
        <h3 className="text-lg font-semibold mb-2">Hoverable Card</h3>
        <p className="text-default-600">
          This card has hover and press effects.
        </p>
      </CardBody>
    </Card>
  ),
};

export const GhitDeskTicketCard: Story = {
  render: () => (
    <Card className="w-full max-w-md" isPressable>
      <CardHeader className="flex justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-small text-default-500">#TICKET-12345</p>
            <Chip size="sm" color="warning" variant="flat">Em Andamento</Chip>
          </div>
          <h3 className="text-lg font-semibold">Erro no login do sistema</h3>
        </div>
        <Chip size="sm" color="danger" variant="bordered">Alta</Chip>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="text-default-600 mb-3">
          Cliente reportando erro ao tentar fazer login. Mensagem de erro: "Credenciais inválidas"
        </p>
        <div className="flex gap-4 text-small text-default-500">
          <div className="flex items-center gap-1">
            <MessageCircle size={14} />
            <span>3 mensagens</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>2h restantes</span>
          </div>
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="justify-between">
        <p className="text-small text-default-500">Atribuído: João Silva</p>
        <p className="text-small text-default-400">Criado há 4h</p>
      </CardFooter>
    </Card>
  ),
};

export const GhitDeskConversationCard: Story = {
  render: () => (
    <Card className="w-full max-w-md" isPressable isHoverable>
      <CardBody className="gap-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold">Maria Santos</h4>
              <p className="text-small text-default-500">maria@example.com</p>
            </div>
          </div>
          <Chip size="sm" color="success" variant="dot">WhatsApp</Chip>
        </div>
        <p className="text-default-600">
          Olá, preciso de ajuda com meu pedido #12345...
        </p>
        <div className="flex justify-between items-center text-small text-default-400">
          <span>há 5 minutos</span>
          <Chip size="sm" color="primary" variant="flat">3 novas</Chip>
        </div>
      </CardBody>
    </Card>
  ),
};
