import React from 'react';
import { cn } from '../../lib/utils';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  menuItems: MenuItem[];
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({
  logo,
  title = 'GhitDesk',
  subtitle = 'TechCorp Ltda',
  menuItems,
  footer,
  collapsed = false,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen bg-surface border-r border-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {logo || (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-text truncate">{title}</h1>
              <p className="text-xs text-text-muted truncate">{subtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                item.active
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text',
                collapsed && 'justify-center'
              )}
            >
              {item.icon && (
                <span className="flex-shrink-0 text-lg">{item.icon}</span>
              )}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={cn(
                        'flex-shrink-0 px-2 py-0.5 rounded-full text-xs',
                        item.active
                          ? 'bg-white/20 text-white'
                          : 'bg-surface text-text-muted'
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-border">
          {footer}
        </div>
      )}
    </aside>
  );
}
