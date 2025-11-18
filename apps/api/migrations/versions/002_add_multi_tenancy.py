"""Add multi-tenancy support

Revision ID: 002_add_multi_tenancy
Revises: 001_initial_tables
Create Date: 2025-11-18

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from uuid import uuid4

# revision identifiers, used by Alembic.
revision: str = '002_add_multi_tenancy'
down_revision: Union[str, None] = '001_initial_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create tenants table
    op.create_table(
        'tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False, unique=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_tenants_slug', 'tenants', ['slug'])
    op.create_index('ix_tenants_slug_is_active', 'tenants', ['slug', 'is_active'])

    # 2. Create default tenant for existing data
    default_tenant_id = str(uuid4())
    op.execute(f"""
        INSERT INTO tenants (id, name, slug, is_active, created_at, updated_at)
        VALUES (
            '{default_tenant_id}',
            'Default Company',
            'default',
            true,
            NOW(),
            NOW()
        )
    """)

    # 3. Add tenant_id columns to all tables (nullable first)
    # Users
    op.add_column('users', sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.execute(f"UPDATE users SET tenant_id = '{default_tenant_id}'")
    op.alter_column('users', 'tenant_id', nullable=False)
    op.create_foreign_key('fk_users_tenant_id', 'users', 'tenants', ['tenant_id'], ['id'], ondelete='RESTRICT')
    op.create_index('ix_users_tenant_id', 'users', ['tenant_id'])

    # Contacts
    op.add_column('contacts', sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.execute(f"UPDATE contacts SET tenant_id = '{default_tenant_id}'")
    op.alter_column('contacts', 'tenant_id', nullable=False)
    op.create_foreign_key('fk_contacts_tenant_id', 'contacts', 'tenants', ['tenant_id'], ['id'], ondelete='RESTRICT')
    op.create_index('ix_contacts_tenant_id', 'contacts', ['tenant_id'])

    # Conversations
    op.add_column('conversations', sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.execute(f"UPDATE conversations SET tenant_id = '{default_tenant_id}'")
    op.alter_column('conversations', 'tenant_id', nullable=False)
    op.create_foreign_key('fk_conversations_tenant_id', 'conversations', 'tenants', ['tenant_id'], ['id'], ondelete='RESTRICT')
    op.create_index('ix_conversations_tenant_id', 'conversations', ['tenant_id'])

    # Messages
    op.add_column('messages', sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.execute(f"UPDATE messages SET tenant_id = '{default_tenant_id}'")
    op.alter_column('messages', 'tenant_id', nullable=False)
    op.create_foreign_key('fk_messages_tenant_id', 'messages', 'tenants', ['tenant_id'], ['id'], ondelete='RESTRICT')
    op.create_index('ix_messages_tenant_id', 'messages', ['tenant_id'])

    # Tickets
    op.add_column('tickets', sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.execute(f"UPDATE tickets SET tenant_id = '{default_tenant_id}'")
    op.alter_column('tickets', 'tenant_id', nullable=False)
    op.create_foreign_key('fk_tickets_tenant_id', 'tickets', 'tenants', ['tenant_id'], ['id'], ondelete='RESTRICT')
    op.create_index('ix_tickets_tenant_id', 'tickets', ['tenant_id'])

    # 4. Update unique constraints and add composite indexes

    # Users: Add composite unique index (tenant_id, email)
    op.drop_constraint('users_email_key', 'users', type_='unique')
    op.create_index('ix_users_tenant_email', 'users', ['tenant_id', 'email'], unique=True)

    # Tickets: Update ticket_number unique constraint to be per-tenant
    op.drop_constraint('tickets_ticket_number_key', 'tickets', type_='unique')
    op.create_index('ix_tickets_tenant_number', 'tickets', ['tenant_id', 'ticket_number'], unique=True)

    # 5. Add new composite indexes for better query performance

    # Contacts
    op.create_index('ix_contacts_tenant_phone', 'contacts', ['tenant_id', 'phone'])
    op.create_index('ix_contacts_tenant_email', 'contacts', ['tenant_id', 'email'])

    # Conversations
    op.create_index('ix_conversations_tenant_status', 'conversations', ['tenant_id', 'status'])
    op.create_index('ix_conversations_tenant_channel', 'conversations', ['tenant_id', 'channel'])

    # Messages
    op.create_index('ix_messages_tenant_conversation', 'messages', ['tenant_id', 'conversation_id'])

    # Tickets
    op.create_index('ix_tickets_tenant_status', 'tickets', ['tenant_id', 'status'])


def downgrade() -> None:
    # Remove composite indexes
    op.drop_index('ix_tickets_tenant_status', 'tickets')
    op.drop_index('ix_messages_tenant_conversation', 'messages')
    op.drop_index('ix_conversations_tenant_channel', 'conversations')
    op.drop_index('ix_conversations_tenant_status', 'conversations')
    op.drop_index('ix_contacts_tenant_email', 'contacts')
    op.drop_index('ix_contacts_tenant_phone', 'contacts')

    # Restore unique constraints
    op.drop_index('ix_tickets_tenant_number', 'tickets')
    op.create_unique_constraint('tickets_ticket_number_key', 'tickets', ['ticket_number'])

    op.drop_index('ix_users_tenant_email', 'users')
    op.create_unique_constraint('users_email_key', 'users', ['email'])

    # Remove tenant_id columns and constraints
    for table in ['tickets', 'messages', 'conversations', 'contacts', 'users']:
        op.drop_constraint(f'fk_{table}_tenant_id', table, type_='foreignkey')
        op.drop_index(f'ix_{table}_tenant_id', table)
        op.drop_column(table, 'tenant_id')

    # Drop tenants table
    op.drop_index('ix_tenants_slug_is_active', 'tenants')
    op.drop_index('ix_tenants_slug', 'tenants')
    op.drop_table('tenants')
