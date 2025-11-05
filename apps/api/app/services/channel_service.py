"""
Channel Service com Factory Pattern
Permite adicionar novos canais sem mudar código existente
"""
from abc import ABC, abstractmethod
from typing import Dict, Type, Optional
from app.models.conversation import Channel
from app.integrations.whatsapp_client import WhatsAppClient


class ChannelHandler(ABC):
    """Interface para handlers de canal"""

    @abstractmethod
    async def send_message(
        self,
        to: str,
        body: str,
        media: Optional[dict] = None,
    ) -> dict:
        """Enviar mensagem outbound"""
        pass

    @abstractmethod
    async def handle_webhook(self, payload: dict) -> dict:
        """Processar webhook inbound"""
        pass


class WhatsAppChannelHandler(ChannelHandler):
    """Handler para WhatsApp Cloud API"""

    def __init__(self):
        self.client = WhatsAppClient.get_instance()

    async def send_message(
        self,
        to: str,
        body: str,
        media: Optional[dict] = None,
    ) -> dict:
        """Enviar via WhatsApp"""
        return await self.client.send_message(
            to_phone=to,
            message_text=body,
            media=media
        )

    async def handle_webhook(self, payload: dict) -> dict:
        """Processar webhook WhatsApp"""
        # Extrair dados do payload WhatsApp
        # Estrutura simplificada para MVP
        return {
            "from": payload.get("from", ""),
            "body": payload.get("text", {}).get("body", ""),
            "message_id": payload.get("id", ""),
            "timestamp": payload.get("timestamp", ""),
        }


class EmailChannelHandler(ChannelHandler):
    """Handler para Email com SMTP"""

    def __init__(self):
        from app.core.config import get_settings
        settings = get_settings()
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@ghitdesk.com')

    async def send_message(
        self,
        to: str,
        body: str,
        media: Optional[dict] = None,
    ) -> dict:
        """Send email via SMTP"""
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        from email.mime.base import MIMEBase
        from email import encoders
        import uuid

        # Check if SMTP is configured
        if not self.smtp_user or not self.smtp_password:
            return {
                "message_id": f"email.dev_{uuid.uuid4()}",
                "status": "sent_dev_mode",
                "warning": "SMTP not configured - using dev mode"
            }

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to
            msg['Subject'] = "GhitDesk - Nova Mensagem"
            msg['Message-ID'] = f"<{uuid.uuid4()}@ghitdesk.com>"

            # Add body
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            # Add attachment if provided
            if media and media.get("url"):
                # In production, download file and attach
                pass

            # Send email
            await aiosmtplib.send(
                msg,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
            )

            return {
                "message_id": msg['Message-ID'],
                "status": "sent",
                "to": to
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }

    async def handle_webhook(self, payload: dict) -> dict:
        """Parse incoming email (IMAP/Webhook)"""
        # Email can come from IMAP polling or webhook (SendGrid, Mailgun, etc)
        return {
            "from": payload.get("from", ""),
            "subject": payload.get("subject", ""),
            "body": payload.get("text", payload.get("plain", "")),
            "html": payload.get("html", ""),
            "message_id": payload.get("message_id", ""),
            "timestamp": payload.get("timestamp", ""),
            "attachments": payload.get("attachments", [])
        }


class TelegramChannelHandler(ChannelHandler):
    """Handler para Telegram Bot API"""

    def __init__(self):
        from app.core.config import get_settings
        import httpx
        settings = get_settings()
        self.bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}" if self.bot_token else ""
        self._client = httpx.AsyncClient(timeout=30.0) if self.bot_token else None

    async def send_message(
        self,
        to: str,  # chat_id in Telegram
        body: str,
        media: Optional[dict] = None,
    ) -> dict:
        """Send message via Telegram Bot API"""
        import uuid

        # Check if Telegram is configured
        if not self.bot_token:
            return {
                "message_id": f"telegram.dev_{uuid.uuid4()}",
                "status": "sent_dev_mode",
                "warning": "Telegram not configured - using dev mode"
            }

        try:
            if media and media.get("url"):
                # Send photo/document with caption
                media_type = media.get("type", "photo")
                endpoint = f"{self.api_url}/send{media_type.capitalize()}"

                payload = {
                    "chat_id": to,
                    media_type: media.get("url"),
                    "caption": body
                }
            else:
                # Send text message
                endpoint = f"{self.api_url}/sendMessage"
                payload = {
                    "chat_id": to,
                    "text": body,
                    "parse_mode": "HTML"
                }

            response = await self._client.post(endpoint, json=payload)
            response.raise_for_status()
            result = response.json()

            if result.get("ok"):
                return {
                    "message_id": result["result"]["message_id"],
                    "status": "sent",
                    "chat_id": to
                }
            else:
                return {
                    "error": result.get("description", "Unknown error"),
                    "status": "failed"
                }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }

    async def handle_webhook(self, payload: dict) -> dict:
        """Parse Telegram webhook payload"""
        # Telegram sends updates in this format
        message = payload.get("message", {})

        return {
            "from": str(message.get("chat", {}).get("id", "")),
            "from_name": message.get("from", {}).get("first_name", ""),
            "from_username": message.get("from", {}).get("username", ""),
            "body": message.get("text", message.get("caption", "")),
            "message_id": str(message.get("message_id", "")),
            "timestamp": str(message.get("date", "")),
            "chat_type": message.get("chat", {}).get("type", "private"),
            "media": {
                "photo": message.get("photo", []),
                "document": message.get("document"),
                "video": message.get("video"),
                "audio": message.get("audio"),
                "voice": message.get("voice"),
            } if any(key in message for key in ["photo", "document", "video", "audio", "voice"]) else None
        }

    async def close(self):
        """Close HTTP client"""
        if self._client:
            await self._client.aclose()


class ChannelFactory:
    """Factory para criar handlers de canal"""

    _handlers: Dict[Channel, Type[ChannelHandler]] = {
        Channel.WHATSAPP: WhatsAppChannelHandler,
        Channel.EMAIL: EmailChannelHandler,
        Channel.TELEGRAM: TelegramChannelHandler,
    }

    @classmethod
    def register_handler(
        cls,
        channel: Channel,
        handler_class: Type[ChannelHandler]
    ) -> None:
        """Registrar novo handler"""
        cls._handlers[channel] = handler_class

    @classmethod
    def create_handler(cls, channel: Channel) -> ChannelHandler:
        """Factory method: criar handler baseado no channel"""
        handler_class = cls._handlers.get(channel)

        if not handler_class:
            raise ValueError(f"Unknown channel: {channel}")

        return handler_class()
