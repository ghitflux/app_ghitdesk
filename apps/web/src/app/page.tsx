import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">GhitDesk</h1>
          <p className="text-sm text-default-500">Design System MVP</p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <p className="text-default-700">
            Todos os componentes HeroUI estão prontos! 🚀
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button color="primary" size="lg">
              Começar
            </Button>
            <Button color="secondary" variant="flat" size="lg">
              Documentação
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button color="success" size="sm" variant="bordered">
              Success
            </Button>
            <Button color="warning" size="sm" variant="bordered">
              Warning
            </Button>
            <Button color="danger" size="sm" variant="bordered">
              Danger
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
