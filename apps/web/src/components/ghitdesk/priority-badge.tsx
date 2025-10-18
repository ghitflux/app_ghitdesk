import { Chip } from "@heroui/chip";
import { AlertCircle } from "lucide-react";

export type Priority = "low" | "medium" | "high" | "urgent";

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityConfig = {
  low: {
    label: "Baixa",
    color: "default" as const,
    icon: false,
  },
  medium: {
    label: "Média",
    color: "primary" as const,
    icon: false,
  },
  high: {
    label: "Alta",
    color: "warning" as const,
    icon: true,
  },
  urgent: {
    label: "Urgente",
    color: "danger" as const,
    icon: true,
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Chip
      color={config.color}
      variant="flat"
      size="sm"
      startContent={config.icon ? <AlertCircle size={14} /> : undefined}
    >
      {config.label}
    </Chip>
  );
}
