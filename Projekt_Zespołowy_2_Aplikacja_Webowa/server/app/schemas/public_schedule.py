from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.base import CamelCaseSchema


class PublicScheduleRange(CamelCaseSchema, BaseModel):
    from_date: date = Field(alias="from")
    to_date: date = Field(alias="to")


class PublicScheduleRoom(CamelCaseSchema, BaseModel):
    id: int
    name: str


class PublicScheduleOccurrence(CamelCaseSchema, BaseModel):
    start_at: datetime
    end_at: datetime
    is_cancelled: bool


class PublicScheduleGroup(CamelCaseSchema, BaseModel):
    group_id: int
    name: str
    level: str
    topic: str
    room: PublicScheduleRoom | None = None
    capacity: int
    enrolled_count: int
    available_spots: int
    waitlist_count: int
    can_join_waitlist: bool
    occurrences: list[PublicScheduleOccurrence]


class PublicScheduleResponse(CamelCaseSchema, BaseModel):
    range: PublicScheduleRange
    groups: list[PublicScheduleGroup] = Field(default_factory=list)
