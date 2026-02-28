from __future__ import annotations

from datetime import date, time
import uuid

from pydantic import BaseModel

from app.models.schedule import ClassSessionStatus
from app.schemas.base import CamelCaseSchema


class CalendarEntryRead(CamelCaseSchema, BaseModel):
    class_session_id: int
    class_group_id: int
    class_group_name: str
    date: date
    start_time: time
    end_time: time
    status: ClassSessionStatus
    room_id: int | None = None
    instructor_id: uuid.UUID | None = None
    topic_id: int
    level_id: int
