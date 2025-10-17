"""Webhook routes"""
from fastapi import APIRouter, Request, Response, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_session
from app.services.channel_service import ChannelFactory
from app.services.message_service import MessageProcessor, WhatsAppInboundStrategy
from app.models.conversation import Channel

router = APIRouter()


@router.get("/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    """WhatsApp webhook verification"""
    # WhatsApp sends verification request
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    # Verificar token (em produção, usar settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN)
    VERIFY_TOKEN = "ghitdesk_verify_token"

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")

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

        return {"status": "ok", "result": result}

    except ValueError as e:
        # Mensagem duplicada
        return {"status": "skipped", "reason": str(e)}
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
