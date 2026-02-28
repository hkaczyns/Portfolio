from __future__ import annotations

from datetime import date, time
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import (
    ClassSession,
    ClassSessionStatus,
    InstructorSubstitution,
)
from app.schemas.class_session import (
    ClassSessionBulkUpdatePayload,
    ClassSessionCreate,
    ClassSessionUpdate,
)


async def list_class_sessions(
    session: AsyncSession,
    from_date: date | None = None,
    to_date: date | None = None,
    class_group_id: int | None = None,
    status: ClassSessionStatus | None = None,
    room_id: int | None = None,
) -> list[ClassSession]:
    query = select(ClassSession)
    if from_date is not None:
        query = query.where(ClassSession.date >= from_date)
    if to_date is not None:
        query = query.where(ClassSession.date <= to_date)
    if class_group_id is not None:
        query = query.where(ClassSession.class_group_id == class_group_id)
    if status is not None:
        query = query.where(ClassSession.status == status)
    if room_id is not None:
        query = query.where(ClassSession.room_id == room_id)
    query = query.order_by(ClassSession.date, ClassSession.start_time)
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_class_session(
    session: AsyncSession, class_session_id: int
) -> ClassSession | None:
    return await session.get(ClassSession, class_session_id)


async def create_class_session(
    session: AsyncSession, data: ClassSessionCreate
) -> ClassSession:
    class_session = ClassSession(**data.model_dump())
    session.add(class_session)
    await session.commit()
    await session.refresh(class_session)
    return class_session


async def update_class_session(
    session: AsyncSession,
    class_session: ClassSession,
    data: ClassSessionUpdate,
) -> ClassSession:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(class_session, key, value)
    await session.commit()
    await session.refresh(class_session)
    return class_session


async def delete_class_session(
    session: AsyncSession, class_session: ClassSession
) -> None:
    await session.delete(class_session)
    await session.commit()


async def cancel_class_session(
    session: AsyncSession, class_session: ClassSession, reason: str | None
) -> ClassSession:
    class_session.status = ClassSessionStatus.CANCELLED
    class_session.cancellation_reason = reason
    await session.commit()
    await session.refresh(class_session)
    return class_session


async def complete_class_session(
    session: AsyncSession, class_session: ClassSession, notes: str | None
) -> ClassSession:
    class_session.status = ClassSessionStatus.COMPLETED
    class_session.notes = notes
    await session.commit()
    await session.refresh(class_session)
    return class_session


async def reschedule_class_session(
    session: AsyncSession,
    class_session: ClassSession,
    new_date: date,
    new_start_time: time,
    new_end_time: time,
    reason: str | None,
) -> ClassSession:
    new_session = ClassSession(
        class_group_id=class_session.class_group_id,
        date=new_date,
        start_time=new_start_time,
        end_time=new_end_time,
        instructor_id=class_session.instructor_id,
        room_id=class_session.room_id,
        rescheduled_from_id=class_session.id,
        status=ClassSessionStatus.SCHEDULED,
    )
    class_session.status = ClassSessionStatus.CANCELLED
    class_session.cancellation_reason = reason or "Rescheduled"
    session.add(new_session)
    await session.commit()
    await session.refresh(class_session)
    await session.refresh(new_session)
    return new_session


async def bulk_cancel_class_sessions(
    session: AsyncSession,
    class_group_id: int,
    dates: list[date],
    reason: str | None,
) -> list[ClassSession]:
    result = await session.execute(
        select(ClassSession).where(
            ClassSession.class_group_id == class_group_id,
            ClassSession.date.in_(dates),
        )
    )
    sessions = list(result.scalars().all())
    for class_session in sessions:
        class_session.status = ClassSessionStatus.CANCELLED
        class_session.cancellation_reason = reason
    await session.commit()
    for class_session in sessions:
        await session.refresh(class_session)
    return sessions


async def bulk_update_class_sessions(
    session: AsyncSession,
    session_ids: list[int],
    updates: ClassSessionBulkUpdatePayload,
) -> list[ClassSession]:
    session_id_set = set(session_ids)
    result = await session.execute(
        select(ClassSession).where(ClassSession.id.in_(session_id_set))
    )
    sessions = list(result.scalars().all())
    if len(sessions) != len(session_id_set):
        raise ValueError("Some class sessions were not found.")
    update_data = updates.model_dump(exclude_unset=True)
    for class_session in sessions:
        for key, value in update_data.items():
            setattr(class_session, key, value)
    await session.commit()
    for class_session in sessions:
        await session.refresh(class_session)
    return sessions


async def list_substitutions(
    session: AsyncSession, class_session_id: int
) -> list[InstructorSubstitution]:
    result = await session.execute(
        select(InstructorSubstitution).where(
            InstructorSubstitution.class_session_id == class_session_id
        )
    )
    return list(result.scalars().all())


async def get_substitution(
    session: AsyncSession, substitution_id: int
) -> InstructorSubstitution | None:
    return await session.get(InstructorSubstitution, substitution_id)


async def create_substitution(
    session: AsyncSession,
    class_session: ClassSession,
    substitute_instructor_id: uuid.UUID,
    reason: str | None,
    created_by: uuid.UUID | None,
) -> InstructorSubstitution:
    if class_session.instructor_id is None:
        raise ValueError("Class session has no instructor assigned.")
    substitution = InstructorSubstitution(
        class_session_id=class_session.id,
        original_instructor_id=class_session.instructor_id,
        substitute_instructor_id=substitute_instructor_id,
        reason=reason,
        created_by=created_by,
    )
    session.add(substitution)
    await session.commit()
    await session.refresh(substitution)
    return substitution


async def delete_substitution(
    session: AsyncSession, substitution: InstructorSubstitution
) -> None:
    await session.delete(substitution)
    await session.commit()
