"""Test Channel Factory"""
import pytest
from app.services.channel_service import (
    ChannelFactory,
    WhatsAppChannelHandler,
    EmailChannelHandler,
)
from app.models.conversation import Channel


def test_create_whatsapp_handler():
    """Test creating WhatsApp handler"""
    handler = ChannelFactory.create_handler(Channel.WHATSAPP)

    assert isinstance(handler, WhatsAppChannelHandler)


def test_create_email_handler():
    """Test creating Email handler"""
    handler = ChannelFactory.create_handler(Channel.EMAIL)

    assert isinstance(handler, EmailChannelHandler)


def test_unknown_channel():
    """Test creating handler for unknown channel"""
    # Create a fake channel not in factory
    with pytest.raises(ValueError, match="Unknown channel"):
        # This would fail because Twitter is defined but not fully implemented
        # We're testing the factory pattern validation
        class FakeChannel:
            value = "unknown"

        ChannelFactory.create_handler(FakeChannel())


@pytest.mark.asyncio
async def test_whatsapp_send_message():
    """Test WhatsApp send message (mocked)"""
    handler = ChannelFactory.create_handler(Channel.WHATSAPP)

    result = await handler.send_message(
        to="+5511999998888",
        body="Test message"
    )

    # Mock returns fake response
    assert "messages" in result or "status" in result


@pytest.mark.asyncio
async def test_whatsapp_handle_webhook():
    """Test WhatsApp webhook handling"""
    handler = ChannelFactory.create_handler(Channel.WHATSAPP)

    payload = {
        "from": "+5511999998888",
        "id": "msg123",
        "timestamp": "1234567890",
        "text": {"body": "Hello"}
    }

    result = await handler.handle_webhook(payload)

    assert "from" in result
    assert "body" in result
    assert result["body"] == "Hello"


@pytest.mark.asyncio
async def test_email_not_implemented():
    """Test Email handler raises NotImplementedError"""
    handler = ChannelFactory.create_handler(Channel.EMAIL)

    with pytest.raises(NotImplementedError):
        await handler.send_message(to="test@example.com", body="Test")
