"""
WhatsApp Cloud API Client (Singleton Pattern)
"""
import httpx
from typing import Optional
from app.core.config import get_settings


class WhatsAppClient:
    """Singleton WhatsApp Cloud API client"""

    _instance: Optional["WhatsAppClient"] = None
    _client: Optional[httpx.AsyncClient] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get_instance(cls) -> "WhatsAppClient":
        """Get WhatsApp client instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def initialize(self):
        """Initialize HTTP client"""
        if self._client is None:
            settings = get_settings()
            self._client = httpx.AsyncClient(
                base_url=settings.WHATSAPP_API_URL if hasattr(settings, 'WHATSAPP_API_URL') else "https://graph.facebook.com/v18.0",
                timeout=30.0,
            )

    async def send_message(
        self,
        to_phone: str,
        message_text: str,
        media: Optional[dict] = None,
    ) -> dict:
        """Send message via WhatsApp"""
        if self._client is None:
            await self.initialize()

        settings = get_settings()

        # Simplificado para MVP
        # Em produção, usar settings.WHATSAPP_API_TOKEN, settings.WHATSAPP_PHONE_ID
        payload = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": "text",
            "text": {"body": message_text}
        }

        # Simulação para MVP (sem API real ainda)
        return {
            "messages": [{"id": f"wamid.fake_{to_phone}"}],
            "status": "sent"
        }

        # Código real (descomentar quando configurar WhatsApp)
        # response = await self._client.post(
        #     f"/{settings.WHATSAPP_PHONE_ID}/messages",
        #     json=payload,
        #     headers={"Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}"}
        # )
        # return response.json()

    async def close(self):
        """Close HTTP client"""
        if self._client:
            await self._client.aclose()
            self._client = None
