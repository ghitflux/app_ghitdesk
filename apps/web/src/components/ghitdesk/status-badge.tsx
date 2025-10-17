'use client';

import { Chip } from "@heroui/react";
import { Circle, Clock, CheckCircle, XCircle } from "lucide-react";

type Status = "open" | "in_progress" | "resolved" | "closed";

const statusConfig: Record<Status, {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  icon: React.ComponentType<{ className?: string; size?: number }>;
}> = {
  open: {
    label: "Aberto",
    color: "primary",
    icon: Circle,
  },
  in_progress: {
    label: "Em Andamento",
    color: "warning",
    icon: Clock,
  },
  resolved: {
    label: "Resolvido",
    color: "success",
    icon: CheckCircle,
  },
  closed: {
    label: "Fechado",
    color: "default",
    icon: XCircle,
  },
};

interface StatusBadgeProps {
  status: Status;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "flat" | "faded" | "shadow" | "dot";
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  size = "md",
  variant = "flat",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Chip
      color={config.color}
      size={size}
      variant={variant}
      startContent={showIcon ? <Icon size={16} /> : undefined}
      className={className}
    >
      {config.label}
    </Chip>
  );
}
