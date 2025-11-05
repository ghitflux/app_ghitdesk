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
        """Send message via WhatsApp Cloud API"""
        if self._client is None:
            await self.initialize()

        settings = get_settings()

        # Build payload
        if media and media.get("url"):
            # Send media message
            payload = {
                "messaging_product": "whatsapp",
                "to": to_phone,
                "type": media.get("type", "image"),
                media.get("type", "image"): {
                    "link": media.get("url"),
                    "caption": message_text if message_text else ""
                }
            }
        else:
            # Send text message
            payload = {
                "messaging_product": "whatsapp",
                "to": to_phone,
                "type": "text",
                "text": {"body": message_text}
            }

        # Check if WhatsApp is configured
        if not hasattr(settings, 'WHATSAPP_API_TOKEN') or not settings.WHATSAPP_API_TOKEN:
            # Development mode - return mock response
            return {
                "messages": [{"id": f"wamid.dev_{to_phone}_{len(message_text)}"}],
                "status": "sent_dev_mode",
                "warning": "WhatsApp not configured - using dev mode"
            }

        try:
            # Production mode - call real WhatsApp API
            response = await self._client.post(
                f"/{settings.WHATSAPP_PHONE_ID}/messages",
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            # Log error and return failure response
            return {
                "error": str(e),
                "status": "failed",
                "status_code": e.response.status_code,
                "detail": e.response.text
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }

    async def send_template_message(
        self,
        to_phone: str,
        template_name: str,
        language_code: str = "pt_BR",
        components: Optional[list] = None,
    ) -> dict:
        """Send template message via WhatsApp"""
        if self._client is None:
            await self.initialize()

        settings = get_settings()

        payload = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code}
            }
        }

        if components:
            payload["template"]["components"] = components

        if not hasattr(settings, 'WHATSAPP_API_TOKEN') or not settings.WHATSAPP_API_TOKEN:
            return {
                "messages": [{"id": f"wamid.dev_template_{to_phone}"}],
                "status": "sent_dev_mode",
                "warning": "WhatsApp not configured - using dev mode"
            }

        try:
            response = await self._client.post(
                f"/{settings.WHATSAPP_PHONE_ID}/messages",
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }

    async def mark_as_read(self, message_id: str) -> dict:
        """Mark message as read"""
        if self._client is None:
            await self.initialize()

        settings = get_settings()

        if not hasattr(settings, 'WHATSAPP_API_TOKEN') or not settings.WHATSAPP_API_TOKEN:
            return {"status": "read_dev_mode"}

        try:
            response = await self._client.post(
                f"/{settings.WHATSAPP_PHONE_ID}/messages",
                json={
                    "messaging_product": "whatsapp",
                    "status": "read",
                    "message_id": message_id
                },
                headers={
                    "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }

    async def close(self):
        """Close HTTP client"""
        if self._client:
            await self._client.aclose()
            self._client = None
