from __future__ import annotations

from datetime import datetime, time
import uuid

from pydantic import BaseModel, Field

from app.models.schedule import ClassGroupStatus
from app.schemas.base import CamelCaseSchema


class ClassGroupBase(CamelCaseSchema, BaseModel):
    semester_id: int
    name: str = Field(..., max_length=128)
    description: str | None = None
    level_id: int
    topic_id: int
    room_id: int | None = None
    capacity: int
    day_of_week: int
    start_time: time
    end_time: time
    instructor_id: uuid.UUID | None = None
    is_public: bool = False
    status: ClassGroupStatus = ClassGroupStatus.DRAFT


class ClassGroupCreate(ClassGroupBase):
    pass


class ClassGroupUpdate(CamelCaseSchema, BaseModel):
    semester_id: int | None = None
    name: str | None = Field(default=None, max_length=128)
    description: str | None = None
    level_id: int | None = None
    topic_id: int | None = None
    room_id: int | None = None
    capacity: int | None = None
    day_of_week: int | None = None
    start_time: time | None = None
    end_time: time | None = None
    instructor_id: uuid.UUID | None = None
    is_public: bool | None = None
    status: ClassGroupStatus | None = None


class ClassGroupRead(ClassGroupBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None


class ClassGroupAvailabilityRead(CamelCaseSchema, BaseModel):
    capacity: int
    enrolled_count: int
    available_spots: int
    waitlist_count: int
    is_full: bool
    can_join_waitlist: bool


class ClassGroupWithAvailability(ClassGroupRead):
    enrolled_count: int
    available_spots: int
    waitlist_count: int
    is_full: bool
    can_join_waitlist: bool
    next_session_at: datetime | None = None
