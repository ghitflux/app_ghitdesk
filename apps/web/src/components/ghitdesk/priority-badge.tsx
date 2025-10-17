'use client';

import { Chip } from "@heroui/react";
import { AlertCircle, AlertTriangle, AlertOctagon, Zap } from "lucide-react";

type Priority = "low" | "medium" | "high" | "urgent";

const priorityConfig: Record<Priority, {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  icon: React.ComponentType<{ className?: string; size?: number }>;
}> = {
  low: {
    label: "Baixa",
    color: "success",
    icon: AlertCircle,
  },
  medium: {
    label: "Média",
    color: "warning",
    icon: AlertTriangle,
  },
  high: {
    label: "Alta",
    color: "danger",
    icon: AlertOctagon,
  },
  urgent: {
    label: "Urgente",
    color: "danger",
    icon: Zap,
  },
};

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "flat" | "faded" | "shadow" | "dot";
  className?: string;
}

export function PriorityBadge({
  priority,
  showIcon = true,
  size = "md",
  variant = "flat",
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority];
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
