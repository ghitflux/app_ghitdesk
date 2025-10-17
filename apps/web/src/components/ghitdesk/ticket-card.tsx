'use client';

import { Card, CardHeader, CardBody, CardFooter, Divider, Avatar } from "@heroui/react";
import { MessageCircle, Clock } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { ChannelBadge } from "./channel-badge";

interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  channel: "whatsapp" | "email" | "telegram" | "twitter";
  assignee?: {
    name: string;
    avatar?: string;
  };
  messageCount: number;
  slaRemaining?: string;
  createdAt: string;
  isPressable?: boolean;
  onClick?: () => void;
}

export function TicketCard({
  id,
  title,
  description,
  status,
  priority,
  channel,
  assignee,
  messageCount,
  slaRemaining,
  createdAt,
  isPressable = true,
  onClick,
}: TicketCardProps) {
  return (
    <Card
      className="w-full"
      isPressable={isPressable}
      onPress={onClick}
    >
      <CardHeader className="flex justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-small text-default-500">{id}</p>
            <ChannelBadge channel={channel} size="sm" variant="dot" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <PriorityBadge priority={priority} size="sm" variant="bordered" />
          <StatusBadge status={status} size="sm" />
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="text-default-600 mb-3 line-clamp-2">
          {description}
        </p>
        <div className="flex gap-4 text-small text-default-500">
          <div className="flex items-center gap-1">
            <MessageCircle size={14} />
            <span>{messageCount} {messageCount === 1 ? 'mensagem' : 'mensagens'}</span>
          </div>
          {slaRemaining && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{slaRemaining}</span>
            </div>
          )}
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="justify-between">
        {assignee ? (
          <div className="flex items-center gap-2">
            <Avatar
              size="sm"
              name={assignee.name}
              src={assignee.avatar}
              className="w-6 h-6"
            />
            <p className="text-small text-default-500">{assignee.name}</p>
          </div>
        ) : (
          <p className="text-small text-default-400">Não atribuído</p>
        )}
        <p className="text-small text-default-400">{createdAt}</p>
      </CardFooter>
    </Card>
  );
}
