from __future__ import annotations

from datetime import date
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import ClassGroup, ClassSession


async def list_calendar_entries(
    session: AsyncSession,
    from_date: date | None = None,
    to_date: date | None = None,
    room_id: int | None = None,
    instructor_id: uuid.UUID | None = None,
) -> list[dict]:
    query = (
        select(ClassSession, ClassGroup)
        .join(ClassGroup, ClassSession.class_group_id == ClassGroup.id)
        .order_by(ClassSession.date, ClassSession.start_time)
    )
    if from_date is not None:
        query = query.where(ClassSession.date >= from_date)
    if to_date is not None:
        query = query.where(ClassSession.date <= to_date)
    if room_id is not None:
        query = query.where(ClassSession.room_id == room_id)
    if instructor_id is not None:
        query = query.where(ClassSession.instructor_id == instructor_id)

    result = await session.execute(query)
    entries = []
    for class_session, class_group in result.all():
        entries.append(
            {
                "class_session_id": class_session.id,
                "class_group_id": class_group.id,
                "class_group_name": class_group.name,
                "date": class_session.date,
                "start_time": class_session.start_time,
                "end_time": class_session.end_time,
                "status": class_session.status,
                "room_id": class_session.room_id,
                "instructor_id": class_session.instructor_id,
                "topic_id": class_group.topic_id,
                "level_id": class_group.level_id,
            }
        )
    return entries
