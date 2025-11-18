"""Webhook routes"""
from uuid import UUID
from fastapi import APIRouter, Request, Response, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_session
from app.db.repositories.tenant import TenantRepository
from app.services.channel_service import ChannelFactory
from app.services.message_service import MessageProcessor, WhatsAppInboundStrategy
from app.models.conversation import Channel

router = APIRouter()


async def get_tenant_from_webhook(
    request: Request,
    session: AsyncSession
) -> UUID:
    """
    Determine tenant from webhook request.
    Priority:
    1. X-Tenant-Slug header (most secure)
    2. X-Tenant-Id header (direct tenant_id)
    3. Default tenant (fallback for development)
    """
    tenant_repo = TenantRepository(session)

    # Option 1: Tenant slug in header (recommended for production)
    tenant_slug = request.headers.get("X-Tenant-Slug")
    if tenant_slug:
        tenant = await tenant_repo.get_active_by_slug(tenant_slug)
        if tenant:
            return tenant.id
        raise HTTPException(status_code=404, detail=f"Tenant '{tenant_slug}' not found")

    # Option 2: Direct tenant_id in header
    tenant_id_str = request.headers.get("X-Tenant-Id")
    if tenant_id_str:
        try:
            tenant_id = UUID(tenant_id_str)
            tenant = await tenant_repo.get(tenant_id)
            if tenant and tenant.is_active:
                return tenant_id
            raise HTTPException(status_code=404, detail="Tenant not found or inactive")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid tenant_id format")

    # Option 3: Fallback to default tenant (for development/testing)
    # In production, you should REQUIRE tenant identification
    default_tenant = await tenant_repo.get_by_slug("default")
    if default_tenant:
        return default_tenant.id

    raise HTTPException(
        status_code=400,
        detail="Tenant identification required. Use X-Tenant-Slug or X-Tenant-Id header"
    )


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
    """
    WhatsApp webhook inbound messages (tenant-aware).

    Requires tenant identification via headers:
    - X-Tenant-Slug: tenant slug (e.g., 'acme')
    - X-Tenant-Id: tenant UUID (alternative)
    """
    try:
        # Determine tenant from webhook request
        tenant_id = await get_tenant_from_webhook(request, session)

        payload = await request.json()

        # Processar webhook com Factory Pattern
        handler = ChannelFactory.create_handler(Channel.WHATSAPP)
        message_data = await handler.handle_webhook(payload)

        # Add tenant_id to message data for processing
        message_data["tenant_id"] = tenant_id

        # Processar mensagem com Strategy Pattern
        processor = MessageProcessor(WhatsAppInboundStrategy())
        result = await processor.handle_message(message_data, session)

        return {"status": "ok", "result": result, "tenant_id": str(tenant_id)}

    except ValueError as e:
        # Mensagem duplicada
        return {"status": "skipped", "reason": str(e)}
    except HTTPException:
        # Re-raise HTTP exceptions (tenant not found, etc.)
        raise
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
