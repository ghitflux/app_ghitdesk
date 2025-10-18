import { Card, CardBody, CardHeader, Avatar } from "@heroui/react";
import { MessageSquare, Clock } from "lucide-react";
import { StatusBadge, type Status } from "./status-badge";
import { PriorityBadge, type Priority } from "./priority-badge";
import { ChannelBadge, type Channel } from "./channel-badge";

interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  channel: Channel;
  messageCount: number;
  slaRemaining?: string;
  createdAt: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
}

export function TicketCard({
  id,
  title,
  description,
  status,
  priority,
  channel,
  messageCount,
  slaRemaining,
  createdAt,
  assignee,
}: TicketCardProps) {
  return (
    <Card className="hover:bg-default-100 transition-colors cursor-pointer">
      <CardHeader className="flex flex-col gap-3 items-start">
        <div className="flex justify-between items-start w-full">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-default-500 font-mono">{id}</span>
              <ChannelBadge channel={channel} />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>
        </div>
        <p className="text-sm text-default-600 line-clamp-2">{description}</p>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="flex justify-between items-center text-xs text-default-500">
          <div className="flex items-center gap-4">
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar
                  size="sm"
                  name={assignee.name}
                  src={assignee.avatar}
                  className="w-6 h-6"
                />
                <span>{assignee.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>{messageCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {slaRemaining && (
              <div className="flex items-center gap-1 text-warning">
                <Clock size={14} />
                <span>{slaRemaining}</span>
              </div>
            )}
            <span>{createdAt}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
