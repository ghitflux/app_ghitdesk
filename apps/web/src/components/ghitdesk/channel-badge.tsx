'use client';

import { Chip } from "@heroui/react";
import { MessageCircle, Mail, Send, Twitter } from "lucide-react";

type Channel = "whatsapp" | "email" | "telegram" | "twitter";

const channelConfig: Record<Channel, {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  icon: React.ComponentType<{ className?: string; size?: number }>;
}> = {
  whatsapp: {
    label: "WhatsApp",
    color: "success",
    icon: MessageCircle,
  },
  email: {
    label: "Email",
    color: "secondary",
    icon: Mail,
  },
  telegram: {
    label: "Telegram",
    color: "primary",
    icon: Send,
  },
  twitter: {
    label: "Twitter",
    color: "primary",
    icon: Twitter,
  },
};

interface ChannelBadgeProps {
  channel: Channel;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "flat" | "faded" | "shadow" | "dot";
  className?: string;
}

export function ChannelBadge({
  channel,
  showIcon = true,
  size = "md",
  variant = "flat",
  className,
}: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;

  return (
    <Chip
      color={config.color}
      size={size}
      variant={variant}
      startContent={showIcon ? <Icon size={16} /> : undefined}
      className={className}
    >
      {config.label}
    </Chip>
  );
}
