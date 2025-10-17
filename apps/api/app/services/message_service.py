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
    4. Emit SSE para agents (será implementado)
    """

    async def process(
        self,
        message_data: dict,
        session: AsyncSession,
    ) -> dict:
        # 1. Verificar duplicatas (Redis)
        redis = await RedisClient.get_instance()
        message_id = message_data.get("message_id", "")
        dedup_key = f"message:{message_id}"

        if await redis.exists(dedup_key):
            raise ValueError("Message already processed")

        # Marcar como processada (24h TTL)
        await redis.setex(dedup_key, 86400, "1")

        # 2. TODO: Buscar/criar conversation
        # 3. TODO: Salvar mensagem no banco
        # 4. TODO: Emit SSE event

        return {
            "status": "processed",
            "message_id": message_id,
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
