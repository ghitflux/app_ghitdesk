import React from 'react';
import { cn } from '../../lib/utils';

export interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  notifications?: number;
  user?: {
    name: string;
    avatar?: string;
  };
  onThemeToggle?: () => void;
  className?: string;
}

export function Header({
  title,
  breadcrumbs,
  searchPlaceholder = 'Buscar conversas, tickets ou contatos...',
  onSearch,
  actions,
  notifications,
  user,
  onThemeToggle,
  className,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className={cn('bg-surface border-b border-border', className)}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Title/Breadcrumbs */}
          <div className="flex-1 min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-text-muted">/</span>}
                    <button
                      className={cn(
                        'hover:text-primary transition-colors',
                        index === breadcrumbs.length - 1
                          ? 'text-text font-medium'
                          : 'text-text-muted'
                      )}
                    >
                      {crumb.label}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            ) : title ? (
              <h1 className="text-2xl font-bold text-text">{title}</h1>
            ) : null}
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                className="input-base w-full pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <svg
                  className="w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>
            )}

            {/* Notifications */}
            {notifications !== undefined && (
              <button className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors">
                <svg
                  className="w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                )}
              </button>
            )}

            {/* Custom Actions */}
            {actions}

            {/* User Menu */}
            {user && (
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-text hidden md:block">
                  {user.name}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
