import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '../../lib/utils';
import { StatusBadge, PriorityBadge, SLABadge } from '../data-display/Badge';
import { Avatar } from '../data-display/Avatar';

export interface TicketCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  slaStatus?: 'ok' | 'warning' | 'critical';
  createdAt?: string;
  isDraggable?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TicketCard({
  id,
  title,
  description,
  status,
  priority,
  assignee,
  tags = [],
  slaStatus,
  createdAt,
  isDraggable = true,
  isDragging = false,
  onClick,
  className,
}: TicketCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: !isDraggable,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'card-base p-4 space-y-3 transition-all duration-200',
        isDraggable && 'cursor-grab active:cursor-grabbing card-hover',
        isDragging && 'opacity-50',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-text line-clamp-2 flex-1">{title}</h4>
        {slaStatus && <SLABadge status={slaStatus} />}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-text-muted line-clamp-2">{description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-text-muted border border-border"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-text-muted border border-border">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={priority} />
          {assignee && (
            <Avatar
              src={assignee.avatar}
              fallback={assignee.name}
              size="sm"
              className="ml-1"
            />
          )}
        </div>
        {createdAt && (
          <span className="text-xs text-text-muted">
            {new Date(createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        )}
      </div>
    </div>
  );
}
