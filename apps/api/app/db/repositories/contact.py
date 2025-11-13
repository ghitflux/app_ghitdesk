"""Contact repository"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import Contact


class ContactRepository:
    """Contact repository with custom query methods"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, id: UUID) -> Optional[Contact]:
        """Get contact by ID"""
        result = await self.session.execute(
            select(Contact).where(Contact.id == id)
        )
        return result.scalars().first()

    async def get_by_phone(self, phone: str) -> Optional[Contact]:
        """Get contact by phone number"""
        result = await self.session.execute(
            select(Contact).where(Contact.phone == phone)
        )
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[Contact]:
        """Get contact by email"""
        result = await self.session.execute(
            select(Contact).where(Contact.email == email)
        )
        return result.scalars().first()

    async def find_by_phone_or_email(
        self,
        phone: Optional[str] = None,
        email: Optional[str] = None
    ) -> Optional[Contact]:
        """Find contact by phone or email"""
        if not phone and not email:
            return None

        conditions = []
        if phone:
            conditions.append(Contact.phone == phone)
        if email:
            conditions.append(Contact.email == email)

        result = await self.session.execute(
            select(Contact).where(or_(*conditions))
        )
        return result.scalars().first()

    async def list(
        self,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Contact]:
        """List contacts with optional search"""
        query = select(Contact)

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Contact.name.ilike(search_pattern),
                    Contact.phone.ilike(search_pattern),
                    Contact.email.ilike(search_pattern),
                )
            )

        query = query.order_by(Contact.name.asc())
        query = query.offset(skip).limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(self, search: Optional[str] = None) -> int:
        """Count contacts with optional search"""
        query = select(func.count(Contact.id))

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Contact.name.ilike(search_pattern),
                    Contact.phone.ilike(search_pattern),
                    Contact.email.ilike(search_pattern),
                )
            )

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def create(
        self,
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> Contact:
        """Create new contact"""
        contact = Contact(
            name=name,
            phone=phone,
            email=email,
            metadata_=metadata or {},
        )
        self.session.add(contact)
        await self.session.commit()
        await self.session.refresh(contact)
        return contact

    async def update(
        self,
        id: UUID,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> Optional[Contact]:
        """Update contact information"""
        contact = await self.get(id)
        if contact:
            if name is not None:
                contact.name = name
            if phone is not None:
                contact.phone = phone
            if email is not None:
                contact.email = email
            if metadata is not None:
                contact.metadata_ = metadata

            await self.session.commit()
            await self.session.refresh(contact)
        return contact

    async def get_or_create(
        self,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        name: Optional[str] = None,
    ) -> tuple[Contact, bool]:
        """
        Get or create contact by phone or email
        Returns (contact, created) tuple where created is True if new contact
        """
        # Try to find existing contact
        contact = await self.find_by_phone_or_email(phone, email)

        if contact:
            return (contact, False)

        # Create new contact
        contact_name = name or phone or email or "Unknown"
        contact = await self.create(
            name=contact_name,
            phone=phone,
            email=email,
        )
        return (contact, True)
