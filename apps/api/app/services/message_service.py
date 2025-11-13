"""
Message Service com Strategy Pattern
"""
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from app.cache.redis_client import RedisClient


class MessageProcessingStrategy(ABC):
    """Strategy para processar diferentes tipos de mensagens"""

    @abstractmethod
    async def process(
        self,
        message_data: dict,
        session: AsyncSession,
    ) -> dict:
        """Processar mensagem inbound"""
        pass


class WhatsAppInboundStrategy(MessageProcessingStrategy):
    """
    Processa mensagens inbound do WhatsApp
    1. Validar duplicatas (Redis dedup)
    2. Buscar/criar conversation
    3. Salvar mensagem
    4. Emit SSE para agents
    """

    async def process(
        self,
        message_data: dict,
        session: AsyncSession,
    ) -> dict:
        from app.utils.events import broadcast_new_message, broadcast_conversation_update

        # 1. Verificar duplicatas (Redis) - atomic SET NX to prevent race condition
        redis = await RedisClient.get_instance()
        message_id = message_data.get("message_id", "")
        dedup_key = f"message:{message_id}"

        # Atomic: set only if not exists, with 24h TTL
        # Returns True if key was set, False if already exists
        was_set = await redis.set(dedup_key, "1", ex=86400, nx=True)

        if not was_set:
            raise ValueError("Message already processed")

        # 2. TODO: Buscar/criar conversation (simplified for now)
        # For now, use phone number as conversation identifier
        phone = message_data.get("from", "unknown")
        conversation_id = f"whatsapp_{phone}"

        # 3. TODO: Salvar mensagem no banco (will implement with repository later)

        # 4. Broadcast SSE event for real-time updates
        await broadcast_new_message(
            conversation_id=conversation_id,
            message={
                "id": message_id,
                "text": message_data.get("text", ""),
                "from_customer": True,
                "channel": "whatsapp",
                "from": phone,
            }
        )

        # Update conversation with new message
        await broadcast_conversation_update(
            conversation_id=conversation_id,
            changes={
                "last_message_at": message_data.get("timestamp"),
                "unread_count": 1,  # Increment unread
            }
        )

        return {
            "status": "processed",
            "message_id": message_id,
            "conversation_id": conversation_id,
        }


class EmailInboundStrategy(MessageProcessingStrategy):
    """Processa mensagens inbound de Email (futuro)"""

    async def process(
        self,
        message_data: dict,
        session: AsyncSession,
    ) -> dict:
        # TODO: Implementar email parsing
        raise NotImplementedError("Email processing não implementado")


class MessageProcessor:
    """Serviço que usa strategies para processar mensagens"""

    def __init__(self, strategy: MessageProcessingStrategy):
        self.strategy = strategy

    async def handle_message(
        self,
        message_data: dict,
        session: AsyncSession,
    ) -> dict:
        """Processar mensagem com a strategy atual"""
        return await self.strategy.process(message_data, session)

    def set_strategy(self, strategy: MessageProcessingStrategy) -> None:
        """Mudar strategy em tempo de execução"""
        self.strategy = strategy
