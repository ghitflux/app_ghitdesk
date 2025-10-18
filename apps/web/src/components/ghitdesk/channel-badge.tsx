import { Chip } from "@heroui/chip";
import { MessageCircle, Mail, Send, Twitter } from "lucide-react";

export type Channel = "whatsapp" | "email" | "telegram" | "twitter";

interface ChannelBadgeProps {
  channel: Channel;
}

const channelConfig = {
  whatsapp: {
    label: "WhatsApp",
    color: "success" as const,
    icon: MessageCircle,
  },
  email: {
    label: "Email",
    color: "primary" as const,
    icon: Mail,
  },
  telegram: {
    label: "Telegram",
    color: "primary" as const,
    icon: Send,
  },
  twitter: {
    label: "Twitter",
    color: "default" as const,
    icon: Twitter,
  },
};

export function ChannelBadge({ channel }: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;

  return (
    <Chip
      color={config.color}
      variant="bordered"
      size="sm"
      startContent={<Icon size={14} />}
    >
      {config.label}
    </Chip>
  );
}
