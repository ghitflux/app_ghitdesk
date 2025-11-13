"""SSE Events routes"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.integrations.sse_manager import SSEManager
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from uuid import uuid4

router = APIRouter()


@router.get("/stream")
async def events_stream(
    current_user: User = Depends(get_current_user),
):
    """SSE stream endpoint for real-time updates"""
    client_id = str(uuid4())
    sse_manager = SSEManager.get_instance()

    # Start Redis listener if not already running (multi-worker support)
    await sse_manager.start_redis_listener()

    async def event_generator():
        try:
            # Send initial connection message
            yield f"data: {{'event': 'connected', 'client_id': '{client_id}'}}\n\n"

            # Subscribe to events
            async for message in sse_manager.subscribe(client_id):
                yield message

        except Exception as e:
            print(f"SSE error for client {client_id}: {e}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )
