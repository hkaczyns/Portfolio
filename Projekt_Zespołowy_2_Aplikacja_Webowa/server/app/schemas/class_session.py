from __future__ import annotations

import datetime as dt
import uuid

from pydantic import BaseModel, Field

from app.models.schedule import ClassSessionStatus
from app.schemas.base import CamelCaseSchema


class ClassSessionBase(CamelCaseSchema, BaseModel):
    class_group_id: int
    date: dt.date
    start_time: dt.time
    end_time: dt.time
    instructor_id: uuid.UUID | None = None
    room_id: int | None = None
    notes: str | None = None
    status: ClassSessionStatus = ClassSessionStatus.SCHEDULED


class ClassSessionCreate(ClassSessionBase):
    pass


class ClassSessionUpdate(CamelCaseSchema, BaseModel):
    class_group_id: int | None = None
    date: dt.date | None = None
    start_time: dt.time | None = None
    end_time: dt.time | None = None
    instructor_id: uuid.UUID | None = None
    room_id: int | None = None
    notes: str | None = None
    status: ClassSessionStatus | None = None
    cancellation_reason: str | None = None
    rescheduled_from_id: int | None = None


class ClassSessionRead(ClassSessionBase):
    id: int
    cancellation_reason: str | None = None
    rescheduled_from_id: int | None = None
    created_at: dt.datetime


class ClassGroupGenerateSessions(CamelCaseSchema, BaseModel):
    start_date: dt.date
    end_date: dt.date
    skip_dates: list[dt.date] = Field(default_factory=list)


class ClassSessionCancel(CamelCaseSchema, BaseModel):
    reason: str | None = None


class ClassSessionComplete(CamelCaseSchema, BaseModel):
    notes: str | None = None


class ClassSessionReschedule(CamelCaseSchema, BaseModel):
    new_date: dt.date
    new_start_time: dt.time
    new_end_time: dt.time
    reason: str | None = None


class ClassSessionBulkCancel(CamelCaseSchema, BaseModel):
    class_group_id: int
    dates: list[dt.date]
    reason: str | None = None


class ClassSessionBulkUpdatePayload(CamelCaseSchema, BaseModel):
    room_id: int | None = None
    instructor_id: uuid.UUID | None = None


class ClassSessionBulkUpdate(CamelCaseSchema, BaseModel):
    session_ids: list[int]
    updates: ClassSessionBulkUpdatePayload
