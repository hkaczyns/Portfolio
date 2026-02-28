from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import (
    ClassGroup,
    ClassSession,
    ClassSessionStatus,
)
from app.schemas.class_group import ClassGroupCreate, ClassGroupUpdate
from app.schemas.class_session import ClassGroupGenerateSessions


def _matches_day_of_week(day_of_week: int, target_date: date) -> bool:
    if 1 <= day_of_week <= 7:
        return target_date.isoweekday() == day_of_week
    return target_date.weekday() == day_of_week


async def list_class_groups(session: AsyncSession) -> list[ClassGroup]:
    result = await session.execute(select(ClassGroup).order_by(ClassGroup.id))
    return list(result.scalars().all())


async def get_class_group(
    session: AsyncSession, class_group_id: int
) -> ClassGroup | None:
    return await session.get(ClassGroup, class_group_id)


async def create_class_group(
    session: AsyncSession, data: ClassGroupCreate
) -> ClassGroup:
    class_group = ClassGroup(**data.model_dump())
    session.add(class_group)
    await session.commit()
    await session.refresh(class_group)
    return class_group


async def update_class_group(
    session: AsyncSession, class_group: ClassGroup, data: ClassGroupUpdate
) -> ClassGroup:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(class_group, key, value)
    await session.commit()
    await session.refresh(class_group)
    return class_group


async def delete_class_group(
    session: AsyncSession, class_group: ClassGroup
) -> None:
    await session.delete(class_group)
    await session.commit()


async def _find_conflicting_dates(
    session: AsyncSession,
    class_group: ClassGroup,
    candidate_dates: list[date],
) -> list[date]:
    if not candidate_dates:
        return []

    filters = []
    if class_group.room_id is not None:
        filters.append(ClassSession.room_id == class_group.room_id)
    if class_group.instructor_id is not None:
        filters.append(ClassSession.instructor_id == class_group.instructor_id)
    if not filters:
        return []

    result = await session.execute(
        select(ClassSession).where(
            ClassSession.date.in_(candidate_dates),
            ClassSession.status == ClassSessionStatus.SCHEDULED,
            or_(*filters),
        )
    )
    existing_sessions = list(result.scalars().all())

    conflicts: set[date] = set()
    for existing in existing_sessions:
        if (
            class_group.start_time < existing.end_time
            and class_group.end_time > existing.start_time
        ):
            conflicts.add(existing.date)

    return sorted(conflicts)


async def generate_sessions(
    session: AsyncSession,
    class_group: ClassGroup,
    data: ClassGroupGenerateSessions,
) -> list[ClassSession]:
    skip_dates = set(data.skip_dates)
    candidate_dates: list[date] = []
    current_date = data.start_date
    while current_date <= data.end_date:
        if current_date not in skip_dates and _matches_day_of_week(
            class_group.day_of_week, current_date
        ):
            candidate_dates.append(current_date)
        current_date += timedelta(days=1)

    conflicts = await _find_conflicting_dates(
        session, class_group, candidate_dates
    )
    if conflicts:
        conflict_list = ", ".join(item.isoformat() for item in conflicts)
        raise ValueError(f"Conflicting sessions found on: {conflict_list}.")

    sessions = [
        ClassSession(
            class_group_id=class_group.id,
            date=target_date,
            start_time=class_group.start_time,
            end_time=class_group.end_time,
            instructor_id=class_group.instructor_id,
            room_id=class_group.room_id,
            status=ClassSessionStatus.SCHEDULED,
        )
        for target_date in candidate_dates
    ]
    session.add_all(sessions)
    await session.commit()
    for class_session in sessions:
        await session.refresh(class_session)
    return sessions


async def delete_class_group_sessions(
    session: AsyncSession,
    class_group: ClassGroup,
    from_date: date,
    to_date: date,
) -> int:
    result = await session.execute(
        select(ClassSession).where(
            ClassSession.class_group_id == class_group.id,
            ClassSession.date >= from_date,
            ClassSession.date <= to_date,
        )
    )
    sessions = list(result.scalars().all())
    for class_session in sessions:
        await session.delete(class_session)
    await session.commit()
    return len(sessions)
