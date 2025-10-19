import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'badge-base',
  {
    variants: {
      variant: {
        default: 'bg-surface border border-border text-text',
        primary: 'bg-primary/20 text-primary border border-primary/30',
        success: 'bg-success/20 text-success border border-success/30',
        warning: 'bg-warning/20 text-warning border border-warning/30',
        danger: 'bg-danger/20 text-danger border border-danger/30',
        info: 'bg-info/20 text-info border border-info/30',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({
  children,
  variant,
  size,
  dot = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

// Preset badges for common use cases
export function StatusBadge({ status }: { status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' }) {
  const variants = {
    open: { variant: 'primary' as const, label: 'Aberto' },
    in_progress: { variant: 'info' as const, label: 'Em Andamento' },
    pending: { variant: 'warning' as const, label: 'Aguardando' },
    resolved: { variant: 'success' as const, label: 'Resolvido' },
    closed: { variant: 'default' as const, label: 'Fechado' },
  };

  const config = variants[status];

  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' | 'urgent' }) {
  const variants = {
    low: { variant: 'default' as const, label: 'Baixa' },
    medium: { variant: 'info' as const, label: 'Média' },
    high: { variant: 'warning' as const, label: 'Alta' },
    urgent: { variant: 'danger' as const, label: 'Urgente' },
  };

  const config = variants[priority];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SLABadge({ status }: { status: 'ok' | 'warning' | 'critical' }) {
  const variants = {
    ok: { variant: 'success' as const, label: 'No Prazo' },
    warning: { variant: 'warning' as const, label: 'Atenção' },
    critical: { variant: 'danger' as const, label: 'Crítico' },
  };

  const config = variants[status];

  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
