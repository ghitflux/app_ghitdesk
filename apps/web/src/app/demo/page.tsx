import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Select,
  SelectItem,
  Checkbox,
} from "@heroui/react";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/ghitdesk/status-badge";
import { PriorityBadge } from "@/components/ghitdesk/priority-badge";
import { ChannelBadge } from "@/components/ghitdesk/channel-badge";
import { TicketCard } from "@/components/ghitdesk/ticket-card";

export default function DemoPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">GhitDesk Design System</h1>
        <p className="text-lg text-default-500">
          Todos os componentes HeroUI + customizados prontos para uso
        </p>
      </div>

      {/* HeroUI Components */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Componentes HeroUI</h2>

        <div className="space-y-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Buttons</h3>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              <div className="flex gap-2 flex-wrap">
                <Button color="primary">Primary</Button>
                <Button color="secondary">Secondary</Button>
                <Button color="success">Success</Button>
                <Button color="warning">Warning</Button>
                <Button color="danger">Danger</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="bordered" color="primary">Bordered</Button>
                <Button variant="flat" color="primary">Flat</Button>
                <Button variant="ghost" color="primary">Ghost</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button startContent={<Plus size={18} />} color="primary">
                  Criar Ticket
                </Button>
                <Button isIconOnly color="success">
                  <Search size={18} />
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Inputs */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Inputs & Forms</h3>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  placeholder="Digite seu email"
                  type="email"
                />
                <Input
                  label="Senha"
                  placeholder="Digite sua senha"
                  type="password"
                />
              </div>
              <Input
                label="Buscar"
                placeholder="Buscar tickets..."
                startContent={<Search size={18} className="text-default-400" />}
              />
              <Select label="Status" placeholder="Selecione o status">
                <SelectItem key="open">Aberto</SelectItem>
                <SelectItem key="in_progress">Em Andamento</SelectItem>
                <SelectItem key="resolved">Resolvido</SelectItem>
                <SelectItem key="closed">Fechado</SelectItem>
              </Select>
              <div className="flex gap-4">
                <Checkbox color="primary">Opção 1</Checkbox>
                <Checkbox color="primary">Opção 2</Checkbox>
                <Checkbox color="primary">Opção 3</Checkbox>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Custom Components */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Componentes Customizados GhitDesk</h2>

        <div className="space-y-8">
          {/* Badges */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Status, Priority & Channel Badges</h3>
            </CardHeader>
            <Divider />
            <CardBody className="gap-6">
              <div>
                <p className="text-sm text-default-500 mb-3">Status Badges:</p>
                <div className="flex gap-3 flex-wrap">
                  <StatusBadge status="open" />
                  <StatusBadge status="in_progress" />
                  <StatusBadge status="resolved" />
                  <StatusBadge status="closed" />
                </div>
              </div>

              <Divider />

              <div>
                <p className="text-sm text-default-500 mb-3">Priority Badges:</p>
                <div className="flex gap-3 flex-wrap">
                  <PriorityBadge priority="low" />
                  <PriorityBadge priority="medium" />
                  <PriorityBadge priority="high" />
                  <PriorityBadge priority="urgent" />
                </div>
              </div>

              <Divider />

              <div>
                <p className="text-sm text-default-500 mb-3">Channel Badges:</p>
                <div className="flex gap-3 flex-wrap">
                  <ChannelBadge channel="whatsapp" />
                  <ChannelBadge channel="email" />
                  <ChannelBadge channel="telegram" />
                  <ChannelBadge channel="twitter" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Ticket Cards */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Ticket Cards</h3>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TicketCard
                  id="#TICKET-001"
                  title="Sistema fora do ar"
                  description="Clientes não conseguem acessar o sistema desde as 14h. Necessário investigação urgente."
                  status="open"
                  priority="urgent"
                  channel="whatsapp"
                  messageCount={5}
                  slaRemaining="15min restantes"
                  createdAt="há 30min"
                />
                <TicketCard
                  id="#TICKET-002"
                  title="Bug no checkout"
                  description="Erro ao finalizar compra com cartão de crédito"
                  status="in_progress"
                  priority="high"
                  channel="email"
                  assignee={{ name: 'João Silva' }}
                  messageCount={3}
                  slaRemaining="2h restantes"
                  createdAt="há 4h"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <section className="text-center pt-8 border-t border-default-200">
        <p className="text-default-500">
          Design System GhitDesk MVP • Next.js 15 + HeroUI + Tailwind CSS
        </p>
        <p className="text-small text-default-400 mt-2">
          Para ver todos os componentes com variações, acesse o Storybook em{" "}
          <code className="text-primary">localhost:6006</code>
        </p>
      </section>
    </div>
  );
}
