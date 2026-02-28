from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
import uuid

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SqlEnum

from .base import Base


class ChargeType(str, Enum):
    MONTHLY_FEE = "MONTHLY_FEE"
    ADDITIONAL_CLASSES = "ADDITIONAL_CLASSES"
    ADJUSTMENT = "ADJUSTMENT"


class ChargeStatus(str, Enum):
    OPEN = "OPEN"
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    CANCELLED = "CANCELLED"


class PaymentMethod(str, Enum):
    CASH = "cash"
    TRANSFER = "transfer"
    CARD = "card"


class Charge(Base):
    __tablename__ = "charge"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount_due: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    type: Mapped[ChargeType] = mapped_column(
        SqlEnum(ChargeType, name="charge_type"), nullable=False
    )
    status: Mapped[ChargeStatus] = mapped_column(
        SqlEnum(ChargeStatus, name="charge_status"),
        nullable=False,
        default=ChargeStatus.OPEN,
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Payment(Base):
    __tablename__ = "payment"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    payment_method: Mapped[PaymentMethod] = mapped_column(
        SqlEnum(PaymentMethod, name="payment_method"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text)


class PaymentAllocation(Base):
    __tablename__ = "payment_allocation"
    __table_args__ = (
        UniqueConstraint(
            "payment_id",
            "charge_id",
            name="uq_payment_allocation_payment_charge",
        ),
    )

    payment_id: Mapped[int] = mapped_column(
        ForeignKey("payment.id"), primary_key=True
    )
    charge_id: Mapped[int] = mapped_column(
        ForeignKey("charge.id"), primary_key=True
    )
    amount_allocated: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )
