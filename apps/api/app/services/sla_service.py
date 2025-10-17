"""
SLA Service com Strategy Pattern
"""
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from app.models.ticket import TicketPriority


class SLAStrategy(ABC):
    """Interface para diferentes estratégias de SLA"""

    @abstractmethod
    def calculate_resolution_due_at(
        self,
        ticket_priority: TicketPriority,
        created_at: datetime
    ) -> datetime:
        """Calcular prazo de resolução"""
        pass

    @abstractmethod
    def calculate_warning_at(self, resolution_due_at: datetime) -> datetime:
        """Calcular quando alertar (75% do tempo)"""
        pass


class SimpleSLAStrategy(SLAStrategy):
    """SLA v1: simples por prioridade (MVP)"""

    SLA_HOURS = {
        TicketPriority.LOW: 72,
        TicketPriority.MEDIUM: 48,
        TicketPriority.HIGH: 24,
        TicketPriority.URGENT: 4,
    }

    def calculate_resolution_due_at(
        self,
        ticket_priority: TicketPriority,
        created_at: datetime
    ) -> datetime:
        hours = self.SLA_HOURS.get(ticket_priority, 24)
        return created_at + timedelta(hours=hours)

    def calculate_warning_at(self, resolution_due_at: datetime) -> datetime:
        duration = resolution_due_at - datetime.utcnow()
        warning_time = duration * 0.25  # Alerta quando restar 25%
        return resolution_due_at - warning_time


class BusinessHoursSLAStrategy(SLAStrategy):
    """SLA v2: apenas horário comercial (futura)"""

    BUSINESS_HOURS = (9, 18)  # 9h - 18h

    def calculate_resolution_due_at(
        self,
        ticket_priority: TicketPriority,
        created_at: datetime
    ) -> datetime:
        # TODO: Implementar lógica complexa
        # - Pular finais de semana
        # - Pular feriados
        # - Contar apenas horas comerciais
        raise NotImplementedError("BusinessHoursSLA não implementado")

    def calculate_warning_at(self, resolution_due_at: datetime) -> datetime:
        raise NotImplementedError("BusinessHoursSLA não implementado")


class SLAService:
    """Serviço que usa strategy"""

    def __init__(self, strategy: SLAStrategy = None):
        self.strategy = strategy or SimpleSLAStrategy()

    async def calculate_sla_for_ticket(
        self,
        ticket_priority: TicketPriority,
        created_at: datetime
    ) -> dict:
        due_at = self.strategy.calculate_resolution_due_at(
            ticket_priority,
            created_at
        )
        warn_at = self.strategy.calculate_warning_at(due_at)

        now = datetime.utcnow()
        hours_remaining = (due_at - now).total_seconds() / 3600

        return {
            'resolution_due_at': due_at,
            'warning_at': warn_at,
            'hours_remaining': max(0, hours_remaining),
            'is_breached': now > due_at,
            'is_warning': now > warn_at,
        }

    def set_strategy(self, strategy: SLAStrategy):
        """Permite trocar estratégia em tempo de execução"""
        self.strategy = strategy
