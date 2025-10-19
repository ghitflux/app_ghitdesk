'use client';

import React from 'react';
import { Sidebar, Header, type MenuItem } from '@ghit/ui';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: '📥',
      href: '/inbox',
      count: 12,
      active: pathname === '/inbox',
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: '🎫',
      href: '/tickets',
      count: 7,
      active: pathname === '/tickets',
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      icon: '✓',
      href: '/tasks',
      count: 5,
      active: pathname === '/tasks',
    },
    {
      id: 'contacts',
      label: 'Contatos',
      icon: '👥',
      href: '/contacts',
      active: pathname === '/contacts',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: '⚙️',
      href: '/settings',
      active: pathname === '/settings',
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar menuItems={menuItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{ name: 'Carlos Mendes' }}
          notifications={3}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
