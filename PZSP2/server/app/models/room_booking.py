from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal
from enum import Enum
import uuid

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, Text, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SqlEnum

from .base import Base


class RoomBookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RoomBooking(Base):
    __tablename__ = "room_rental_booking"

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("room.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )
    booking_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[RoomBookingStatus] = mapped_column(
        SqlEnum(RoomBookingStatus, name="room_booking_status"),
        nullable=False,
        default=RoomBookingStatus.PENDING,
    )
    purpose: Mapped[str | None] = mapped_column(Text)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id")
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    total_cost: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
