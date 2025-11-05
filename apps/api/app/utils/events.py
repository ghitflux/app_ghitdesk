"""
Real-time Events Utility
Helper functions to broadcast events via SSE
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app.integrations.sse_manager import SSEManager


class EventType:
    """Event types for real-time updates"""
    # Ticket events
    TICKET_CREATED = "ticket:created"
    TICKET_UPDATED = "ticket:updated"
    TICKET_ASSIGNED = "ticket:assigned"
    TICKET_STATUS_CHANGED = "ticket:status_changed"

    # Message events
    MESSAGE_NEW = "message:new"
    MESSAGE_READ = "message:read"

    # Conversation events
    CONVERSATION_NEW = "conversation:new"
    CONVERSATION_UPDATE = "conversation:update"
    CONVERSATION_ASSIGNED = "conversation:assigned"

    # Agent events
    AGENT_ONLINE = "agent:online"
    AGENT_OFFLINE = "agent:offline"
    AGENT_TYPING = "agent:typing"

    # Notification events
    NOTIFICATION_NEW = "notification:new"


async def broadcast_event(
    event_type: str,
    data: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """
    Broadcast event to all connected SSE clients

    Args:
        event_type: Type of event (use EventType constants)
        data: Event data payload
        metadata: Optional metadata (user_id, conversation_id, etc.)
    """
    sse_manager = SSEManager.get_instance()

    event_data = {
        **data,
        "timestamp": datetime.utcnow().isoformat(),
    }

    if metadata:
        event_data["metadata"] = metadata

    await sse_manager.broadcast(event_type, event_data)


async def broadcast_ticket_created(ticket: Dict[str, Any]) -> None:
    """Broadcast ticket created event"""
    await broadcast_event(
        EventType.TICKET_CREATED,
        {
            "ticket_id": ticket.get("id"),
            "ticket_number": ticket.get("ticket_number"),
            "title": ticket.get("title"),
            "priority": ticket.get("priority"),
            "status": ticket.get("status"),
        }
    )


async def broadcast_ticket_updated(
    ticket_id: str,
    changes: Dict[str, Any],
    ticket: Optional[Dict[str, Any]] = None
) -> None:
    """Broadcast ticket updated event"""
    data = {
        "ticket_id": ticket_id,
        "changes": changes,
    }

    if ticket:
        data["ticket"] = ticket

    await broadcast_event(EventType.TICKET_UPDATED, data)


async def broadcast_new_message(
    conversation_id: str,
    message: Dict[str, Any]
) -> None:
    """Broadcast new message event"""
    await broadcast_event(
        EventType.MESSAGE_NEW,
        {
            "conversation_id": conversation_id,
            "message_id": message.get("id"),
            "text": message.get("text", ""),
            "from_customer": message.get("from_customer", True),
            "channel": message.get("channel"),
        },
        metadata={"conversation_id": conversation_id}
    )


async def broadcast_conversation_update(
    conversation_id: str,
    changes: Dict[str, Any]
) -> None:
    """Broadcast conversation update event"""
    await broadcast_event(
        EventType.CONVERSATION_UPDATE,
        {
            "conversation_id": conversation_id,
            "changes": changes,
        },
        metadata={"conversation_id": conversation_id}
    )


async def broadcast_agent_status(
    agent_id: str,
    status: str,  # "online" or "offline"
    agent_name: Optional[str] = None
) -> None:
    """Broadcast agent online/offline status"""
    event_type = EventType.AGENT_ONLINE if status == "online" else EventType.AGENT_OFFLINE

    await broadcast_event(
        event_type,
        {
            "agent_id": agent_id,
            "status": status,
            "agent_name": agent_name,
        }
    )


async def broadcast_notification(
    user_id: str,
    notification: Dict[str, Any]
) -> None:
    """Broadcast notification to specific user"""
    sse_manager = SSEManager.get_instance()

    # For user-specific notifications, we would need to track user->client_id mapping
    # For now, broadcast to all and let frontend filter
    await broadcast_event(
        EventType.NOTIFICATION_NEW,
        {
            "user_id": user_id,
            "title": notification.get("title"),
            "message": notification.get("message"),
            "type": notification.get("type", "info"),
            "link": notification.get("link"),
        }
    )
