import React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-text-muted',
    away: 'bg-warning',
    busy: 'bg-danger',
  };

  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;

  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center font-medium text-text',
          sizeClasses[size]
        )}
      >
        {showFallback ? (
          <span>{initials}</span>
        ) : (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
