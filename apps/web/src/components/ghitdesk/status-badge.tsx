import { Chip } from "@heroui/chip";

export type Status = "open" | "in_progress" | "resolved" | "closed";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  open: {
    label: "Aberto",
    color: "primary" as const,
  },
  in_progress: {
    label: "Em Andamento",
    color: "warning" as const,
  },
  resolved: {
    label: "Resolvido",
    color: "success" as const,
  },
  closed: {
    label: "Fechado",
    color: "default" as const,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Chip
      color={config.color}
      variant="flat"
      size="sm"
    >
      {config.label}
    </Chip>
  );
}
