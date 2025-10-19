import React from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'text-text',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  const trendColor = trend?.direction === 'up' ? 'text-success' : 'text-danger';

  return (
    <div className={cn('card-base p-4 md:p-6', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm text-text-muted mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn('text-2xl md:text-3xl font-bold', variantStyles[variant])}>
              {value}
            </h3>
            {trend && (
              <span className={cn('text-sm font-medium', trendColor)}>
                {trend.direction === 'up' ? '+' : ''}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={cn('text-2xl', variantStyles[variant])}>
            {icon}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
