from __future__ import annotations

from datetime import datetime
from enum import Enum
import uuid
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SqlEnum

from .base import Base


class RequestType(str, Enum):
    ACCOUNT_DELETION = "ACCOUNT_DELETION"
    GROUP_TRANSFER = "GROUP_TRANSFER"
    ROOM_RENTAL = "ROOM_RENTAL"


class RequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class Request(Base):
    __tablename__ = "request"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[RequestType] = mapped_column(
        SqlEnum(RequestType, name="request_type"), nullable=False
    )
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )
    status: Mapped[RequestStatus] = mapped_column(
        SqlEnum(RequestStatus, name="request_status"),
        nullable=False,
        default=RequestStatus.PENDING,
    )
    payload_json: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    decision_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id")
    )
    decision_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    decision_note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
