"""Webhook routes"""
from fastapi import APIRouter, Request, Response, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.db.database import get_session
from app.services.channel_service import ChannelFactory
from app.services.message_service import MessageProcessor, WhatsAppInboundStrategy
from app.models.conversation import Channel
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    """WhatsApp webhook verification"""
    # WhatsApp sends verification request
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    # Use token from environment variable
    if mode == "subscribe" and token == settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully")
        return Response(content=challenge, media_type="text/plain")

    logger.warning(f"WhatsApp webhook verification failed. Mode: {mode}")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def whatsapp_webhook_inbound(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    """WhatsApp webhook inbound messages"""
    try:
        payload = await request.json()

        # Processar webhook com Factory Pattern
        handler = ChannelFactory.create_handler(Channel.WHATSAPP)
        message_data = await handler.handle_webhook(payload)

        # Processar mensagem com Strategy Pattern
        processor = MessageProcessor(WhatsAppInboundStrategy())
        result = await processor.handle_message(message_data, session)

        logger.info(f"WhatsApp message processed: {result.get('message_id', 'unknown')}")
        return {"status": "ok", "result": result}

    except ValueError as e:
        # Mensagem duplicada (esperado)
        logger.debug(f"Duplicate message skipped: {e}")
        return {"status": "skipped", "reason": "Duplicate message"}

    except Exception as e:
        # Log error but don't expose details to client
        logger.error(f"Webhook processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error processing webhook"
        )
