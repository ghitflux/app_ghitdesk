'use client';

import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { MessageCircle, Ticket, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  // Mock data para MVP
  const metrics = {
    totalConversations: 127,
    totalTickets: 89,
    openTickets: 23,
    resolvedTickets: 58,
    avgResponseTime: 12,
    slaCompliance: 94,
  };

  // Tickets over time (last 7 days)
  const ticketsOverTime = [
    { date: '01/11', created: 12, resolved: 8, open: 4 },
    { date: '02/11', created: 15, resolved: 10, open: 9 },
    { date: '03/11', created: 8, resolved: 12, open: 5 },
    { date: '04/11', created: 18, resolved: 15, open: 8 },
    { date: '05/11', created: 14, resolved: 11, open: 11 },
    { date: '06/11', created: 11, resolved: 13, open: 9 },
    { date: '07/11', created: 11, resolved: 9, open: 11 },
  ];

  // Tickets by status
  const ticketsByStatus = [
    { name: 'Aberto', value: 23, color: '#f5a524' },
    { name: 'Em Andamento', value: 15, color: '#0070f0' },
    { name: 'Resolvido', value: 58, color: '#17c964' },
    { name: 'Fechado', value: 8, color: '#7e7e7e' },
  ];

  // Tickets by priority
  const ticketsByPriority = [
    { priority: 'Baixa', count: 32, color: '#7e7e7e' },
    { priority: 'Média', count: 35, color: '#0070f0' },
    { priority: 'Alta', count: 18, color: '#f5a524' },
    { priority: 'Urgente', count: 4, color: '#f31260' },
  ];

  // Response time trend (last 7 days)
  const responseTimeTrend = [
    { date: '01/11', avgTime: 15, targetTime: 20 },
    { date: '02/11', avgTime: 13, targetTime: 20 },
    { date: '03/11', avgTime: 18, targetTime: 20 },
    { date: '04/11', avgTime: 11, targetTime: 20 },
    { date: '05/11', avgTime: 12, targetTime: 20 },
    { date: '06/11', avgTime: 10, targetTime: 20 },
    { date: '07/11', avgTime: 12, targetTime: 20 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-default-500 mt-1">Métricas e análises do sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <MessageCircle size={24} className="text-primary" />
              <span className="text-2xl font-bold">{metrics.totalConversations}</span>
            </div>
            <p className="text-sm text-default-500">Total Conversas</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <Ticket size={24} className="text-warning" />
              <span className="text-2xl font-bold">{metrics.totalTickets}</span>
            </div>
            <p className="text-sm text-default-500">Total Tickets</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <AlertCircle size={24} className="text-danger" />
              <span className="text-2xl font-bold">{metrics.openTickets}</span>
            </div>
            <p className="text-sm text-default-500">Tickets Abertos</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="gap-2">
            <div className="flex items-center justify-between">
              <CheckCircle size={24} className="text-success" />
              <span className="text-2xl font-bold">{metrics.resolvedTickets}</span>
            </div>
            <p className="text-sm text-default-500">Tickets Resolvidos</p>
          </CardBody>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock size={20} />
              Tempo Médio de Resposta
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-3xl font-bold text-primary">
              {metrics.avgResponseTime}min
            </p>
            <p className="text-sm text-default-500 mt-2">
              Baseado nas últimas 24 horas
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp size={20} />
              SLA Compliance
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-3xl font-bold text-success">
              {metrics.slaCompliance}%
            </p>
            <p className="text-sm text-default-500 mt-2">
              Tickets resolvidos dentro do prazo
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Over Time - Line Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Tickets ao Longo do Tempo</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#0070f0" name="Criados" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#17c964" name="Resolvidos" strokeWidth={2} />
                <Line type="monotone" dataKey="open" stroke="#f5a524" name="Abertos" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Tickets by Status - Pie Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Distribuição por Status</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Tickets by Priority - Bar Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Tickets por Prioridade</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Quantidade">
                  {ticketsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Response Time Trend - Area Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Tempo de Resposta Médio</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={responseTimeTrend}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070f0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0070f0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="avgTime" stroke="#0070f0" fillOpacity={1} fill="url(#colorTime)" name="Tempo Real" />
                <Line type="monotone" dataKey="targetTime" stroke="#f5a524" strokeDasharray="5 5" name="Meta (20min)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Analytics Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📊 Analytics & Insights</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-default-700 mb-2">Desempenho Geral</p>
              <ul className="space-y-1 text-default-500">
                <li>• Média de {(metrics.resolvedTickets / 7).toFixed(1)} tickets resolvidos por dia</li>
                <li>• Taxa de resolução: {((metrics.resolvedTickets / metrics.totalTickets) * 100).toFixed(0)}%</li>
                <li>• Tempo médio de resposta abaixo da meta (12min vs 20min)</li>
                <li>• {metrics.slaCompliance}% de conformidade com SLA</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-default-700 mb-2">Tendências</p>
              <ul className="space-y-1 text-default-500">
                <li>✅ Tempo de resposta melhorando (-20% vs semana anterior)</li>
                <li>⚠️ Tickets de alta prioridade precisam atenção (18 abertos)</li>
                <li>✅ SLA compliance acima de 90%</li>
                <li>📈 Volume de conversas crescendo (+15% this week)</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
