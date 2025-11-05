'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Select,
  SelectItem,
  Chip,
} from '@heroui/react';
import { Search, MessageCircle } from 'lucide-react';
import { ChannelBadge } from '@/components/ghitdesk/channel-badge';
import { StatusBadge } from '@/components/ghitdesk/status-badge';
import { useSSE, useSSEEvent } from '@/hooks/useSSE';
import { apiClient } from '@/services/api-client';

interface Conversation {
  id: string;
  channel: 'whatsapp' | 'email' | 'telegram' | 'twitter';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  unread_count: number;
  last_message_at: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { isConnected } = useSSE();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await apiClient.request<{ conversations: Conversation[] }>(
          '/conversations'
        );
        setConversations(data.conversations);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Listen for real-time updates
  useSSEEvent('message:new', (data: any) => {
    console.log('New message received:', data);

    // Update conversation in list or add if new
    setConversations((prev) => {
      const conversationId = data.conversation_id;
      const existingIndex = prev.findIndex((c) => c.id === conversationId);

      if (existingIndex >= 0) {
        // Update existing conversation - move to top
        const updated = [...prev];
        const conversation = { ...updated[existingIndex] };
        conversation.unread_count = (conversation.unread_count || 0) + 1;
        conversation.last_message_at = data.timestamp || new Date().toISOString();
        updated.splice(existingIndex, 1);
        return [conversation, ...updated];
      } else {
        // New conversation
        const newConv: Conversation = {
          id: conversationId,
          channel: data.channel || 'whatsapp',
          status: 'open',
          unread_count: 1,
          last_message_at: data.timestamp || new Date().toISOString(),
        };
        return [newConv, ...prev];
      }
    });
  });

  useSSEEvent('conversation:update', (data: any) => {
    console.log('Conversation updated:', data);

    // Update conversation in list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === data.conversation_id
          ? { ...conv, ...data.changes }
          : conv
      )
    );
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-default-500 mt-1">
            Gerenciar conversas • {isConnected ? '🟢' : '🔴'} Real-time
          </p>
        </div>
        <Select
          label="Canal"
          placeholder="Todos"
          className="w-48"
          onChange={(e) => setChannelFilter(e.target.value)}
        >
          <SelectItem key="whatsapp" value="whatsapp">WhatsApp</SelectItem>
          <SelectItem key="email" value="email">Email</SelectItem>
          <SelectItem key="telegram" value="telegram">Telegram</SelectItem>
        </Select>
      </div>

      <Input
        placeholder="Buscar conversas..."
        startContent={<Search size={18} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardBody>
              <p className="text-center text-default-500">Carregando...</p>
            </CardBody>
          </Card>
        ) : conversations.length === 0 ? (
          <Card>
            <CardBody className="text-center space-y-4 py-12">
              <MessageCircle size={48} className="mx-auto text-default-300" />
              <div>
                <p className="text-lg font-medium">Nenhuma conversa encontrada</p>
                <p className="text-default-500 text-sm mt-1">
                  As conversas aparecerão aqui quando houver mensagens
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          conversations.map((conv) => (
            <Card key={conv.id} isPressable isHoverable>
              <CardBody className="gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">Conversa {conv.id.slice(0, 8)}</h4>
                        <ChannelBadge
                          channel={conv.channel}
                          size="sm"
                          variant="dot"
                        />
                      </div>
                      <p className="text-sm text-default-500">
                        Última mensagem há {new Date(conv.last_message_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <StatusBadge status={conv.status} size="sm" />
                    {conv.unread_count > 0 && (
                      <Chip size="sm" color="primary" variant="flat">
                        {conv.unread_count} novas
                      </Chip>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {conversations.length > 0 && (
        <Card>
          <CardBody className="text-center text-sm text-default-500">
            Mostrando {conversations.length} conversas • ETAPA 4 MVP
          </CardBody>
        </Card>
      )}
    </div>
  );
}
