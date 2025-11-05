/**
 * Data Export Utilities
 * Export data to CSV, JSON, and other formats
 */

export interface ExportOptions {
  filename?: string;
  headers?: string[];
  dateFormat?: 'iso' | 'locale';
}

/**
 * Convert data to CSV format
 */
export function toCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvRows = [
    csvHeaders.join(','), // Header row
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header];
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        })
        .join(',')
    ),
  ];

  return csvRows.join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: any[], options: ExportOptions = {}): void {
  const { filename = 'export.csv', headers } = options;

  const csv = toCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any[], options: ExportOptions = {}): void {
  const { filename = 'export.json' } = options;

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export tickets data to CSV
 */
export function exportTicketsToCSV(tickets: any[]): void {
  const exportData = tickets.map((ticket) => ({
    'Número': ticket.ticket_number || ticket.id,
    'Título': ticket.title,
    'Status': ticket.status,
    'Prioridade': ticket.priority,
    'Criado em': new Date(ticket.created_at).toLocaleString('pt-BR'),
    'SLA Restante': ticket.sla?.hours_remaining || 'N/A',
  }));

  downloadCSV(exportData, {
    filename: `tickets_${new Date().toISOString().split('T')[0]}.csv`,
  });
}

/**
 * Export conversations data to CSV
 */
export function exportConversationsToCSV(conversations: any[]): void {
  const exportData = conversations.map((conv) => ({
    'ID': conv.id,
    'Canal': conv.channel,
    'Status': conv.status,
    'Não Lidas': conv.unread_count,
    'Última Mensagem': new Date(conv.last_message_at).toLocaleString('pt-BR'),
  }));

  downloadCSV(exportData, {
    filename: `conversations_${new Date().toISOString().split('T')[0]}.csv`,
  });
}

/**
 * Export analytics/reports data to CSV
 */
export function exportReportsToCSV(data: {
  metrics?: any;
  ticketsOverTime?: any[];
  ticketsByStatus?: any[];
  ticketsByPriority?: any[];
}): void {
  const { metrics, ticketsOverTime, ticketsByStatus, ticketsByPriority } = data;

  // Create summary sheet
  const summaryData = metrics
    ? [
        { Métrica: 'Total de Conversas', Valor: metrics.totalConversations },
        { Métrica: 'Total de Tickets', Valor: metrics.totalTickets },
        { Métrica: 'Tickets Abertos', Valor: metrics.openTickets },
        { Métrica: 'Tickets Resolvidos', Valor: metrics.resolvedTickets },
        { Métrica: 'Tempo Médio de Resposta (min)', Valor: metrics.avgResponseTime },
        { Métrica: 'SLA Compliance (%)', Valor: metrics.slaCompliance },
      ]
    : [];

  downloadCSV(summaryData, {
    filename: `report_summary_${new Date().toISOString().split('T')[0]}.csv`,
  });

  // Also export detailed data if available
  if (ticketsOverTime && ticketsOverTime.length > 0) {
    downloadCSV(ticketsOverTime, {
      filename: `tickets_over_time_${new Date().toISOString().split('T')[0]}.csv`,
    });
  }
}
