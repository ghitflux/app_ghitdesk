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
    """Handler para Email (futuro)"""

    async def send_message(
        self,
        to: str,
        body: str,
        media: Optional[dict] = None,
    ) -> dict:
        # TODO: Implementar SMTP
        raise NotImplementedError("Email handler não implementado")

    async def handle_webhook(self, payload: dict) -> dict:
        # TODO: Implementar email parsing
        raise NotImplementedError("Email webhook não implementado")


class TelegramChannelHandler(ChannelHandler):
    """Handler para Telegram (futuro)"""

    async def send_message(
        self,
        to: str,
        body: str,
        media: Optional[dict] = None,
    ) -> dict:
        raise NotImplementedError("Telegram handler não implementado")

    async def handle_webhook(self, payload: dict) -> dict:
        raise NotImplementedError("Telegram webhook não implementado")


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
