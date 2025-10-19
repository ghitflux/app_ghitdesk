'use client';

import React from 'react';
import { StatCard } from '@ghit/ui';
import { useTickets, useSLABreachedTickets } from '@/hooks/useTickets';

export default function DashboardPage() {
  const { tickets, isLoading } = useTickets();
  const { data: slaBreached = [] } = useSLABreachedTickets();

  // Calcular métricas
  const activeConversations = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress'
  ).length;

  const resolvedToday = tickets.filter((t) => {
    if (!t.resolvedAt) return false;
    const today = new Date().toDateString();
    return new Date(t.resolvedAt).toDateString() === today;
  }).length;

  const avgResponseTime = '2h 15min'; // Mock - calcular real posteriormente

  const satisfaction = 4.8; // Mock - calcular real posteriormente

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-muted">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-muted mt-1">Visão geral do sistema</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Conversas Ativas"
          value={activeConversations}
          subtitle="5 não lidas"
          trend={{ value: 15, direction: 'up' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          }
          variant="primary"
        />

        <StatCard
          title="SLA a Vencer"
          value={slaBreached.length}
          subtitle="próximas 2 horas"
          trend={{ value: 2, direction: 'down' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          variant="warning"
        />

        <StatCard
          title="TMA"
          value={avgResponseTime}
          subtitle="tempo médio de atendimento"
          trend={{ value: 8, direction: 'down' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          variant="info"
        />

        <StatCard
          title="Satisfação"
          value={satisfaction}
          subtitle="avaliação média"
          trend={{ value: 3, direction: 'up' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
          variant="success"
        />
      </div>

      {/* Volume by Channel */}
      <div className="card-base p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Volume por Canal</h2>
        <p className="text-sm text-text-muted mb-6">
          Conversas recebidas por canal nas últimas 24 horas
        </p>

        <div className="space-y-4">
          {[
            { name: 'WhatsApp', count: 24, color: 'bg-primary', percentage: 40 },
            { name: 'E-mail', count: 16, color: 'bg-info', percentage: 27 },
            { name: 'Instagram', count: 8, color: 'bg-danger', percentage: 13 },
            { name: 'Chat Web', count: 4, color: 'bg-success', percentage: 7 },
          ].map((channel) => (
            <div key={channel.name} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <div className={`w-3 h-3 rounded-full ${channel.color}`} />
                <span className="text-sm text-text">{channel.name}</span>
              </div>
              <div className="flex-1 h-8 bg-surface rounded-lg overflow-hidden">
                <div
                  className={`h-full ${channel.color} transition-all duration-500`}
                  style={{ width: `${channel.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text w-12 text-right">{channel.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card-base p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Atividades Recentes</h2>

        <div className="space-y-4">
          {[
            {
              title: 'Nova conversa no WhatsApp',
              subtitle: 'Maria Silva iniciou uma conversa',
              time: 'há quase 2 anos',
              badge: 'WhatsApp',
            },
            {
              title: 'Ticket resolvido',
              subtitle: 'T-007 foi marcado como resolvido',
              time: 'há quase 2 anos',
              badge: 'Resolvido',
            },
            {
              title: 'SLA a vencer',
              subtitle: 'T-003 vence em 5 minutos',
              time: 'há quase 2 anos',
              badge: 'Crítico',
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text">{activity.title}</h4>
                <p className="text-xs text-text-muted mt-0.5">{activity.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-muted">
                    {activity.badge}
                  </span>
                  <span className="text-xs text-text-muted">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-base p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Ações Rápidas</h2>
        <p className="text-sm text-text-muted mb-6">
          Acesse rapidamente as funcionalidades mais usadas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Abrir Inbox',
              subtitle: 'Visualizar conversas pendentes',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              ),
            },
            {
              title: 'Criar Ticket',
              subtitle: 'Abrir novo ticket de suporte',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              ),
            },
            {
              title: 'Conectar WhatsApp',
              subtitle: 'Configurar canal WhatsApp',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              ),
            },
          ].map((action, index) => (
            <button
              key={index}
              className="p-4 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all text-left"
            >
              <div className="text-primary mb-2">{action.icon}</div>
              <h4 className="text-sm font-medium text-text mb-1">{action.title}</h4>
              <p className="text-xs text-text-muted">{action.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
