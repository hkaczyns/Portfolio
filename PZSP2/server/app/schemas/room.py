from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.base import CamelCaseSchema


class RoomBase(CamelCaseSchema, BaseModel):
    name: str = Field(..., max_length=128)
    capacity: int | None = None
    description: str | None = None
    is_available_for_rental: bool = False
    hourly_rate: Decimal | None = None
    is_active: bool = True


class RoomCreate(RoomBase):
    pass


class RoomUpdate(CamelCaseSchema, BaseModel):
    name: str | None = Field(default=None, max_length=128)
    capacity: int | None = None
    description: str | None = None
    is_available_for_rental: bool | None = None
    hourly_rate: Decimal | None = None
    is_active: bool | None = None


class RoomRead(RoomBase):
    id: int
    created_at: datetime
