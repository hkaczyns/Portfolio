from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Select, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.schedule import (
    ClassGroup,
    ClassGroupStatus,
    ClassSession,
    ClassSessionStatus,
)
from app.schemas.class_group import ClassGroupRead, ClassGroupWithAvailability


def _apply_class_group_filters(
    query: Select,
    semester_id: int | None,
    skill_level_id: int | None,
    topic_id: int | None,
) -> Select:
    if semester_id is not None:
        query = query.where(ClassGroup.semester_id == semester_id)
    if skill_level_id is not None:
        query = query.where(ClassGroup.level_id == skill_level_id)
    if topic_id is not None:
        query = query.where(ClassGroup.topic_id == topic_id)
    return query


def _availability_payload(
    class_group: ClassGroup,
    enrolled_count: int,
    waitlist_count: int,
    next_session_at: datetime | None,
) -> dict:
    available_spots = max(class_group.capacity - enrolled_count, 0)
    is_full = available_spots <= 0
    return {
        "enrolled_count": enrolled_count,
        "available_spots": available_spots,
        "waitlist_count": waitlist_count,
        "is_full": is_full,
        "can_join_waitlist": is_full,
        "next_session_at": next_session_at,
    }


async def get_class_group_availability(
    session: AsyncSession, class_group_id: int
) -> dict | None:
    counts_subq = (
        select(
            Enrollment.class_group_id.label("class_group_id"),
            func.sum(
                case(
                    (Enrollment.status == EnrollmentStatus.ACTIVE, 1),
                    else_=0,
                )
            ).label("enrolled_count"),
            func.sum(
                case(
                    (Enrollment.status == EnrollmentStatus.WAITLISTED, 1),
                    else_=0,
                )
            ).label("waitlist_count"),
        )
        .where(Enrollment.class_group_id == class_group_id)
        .group_by(Enrollment.class_group_id)
        .subquery()
    )

    result = await session.execute(
        select(
            ClassGroup,
            counts_subq.c.enrolled_count,
            counts_subq.c.waitlist_count,
        )
        .outerjoin(counts_subq, counts_subq.c.class_group_id == ClassGroup.id)
        .where(ClassGroup.id == class_group_id)
    )
    row = result.first()
    if not row:
        return None
    class_group, enrolled_count, waitlist_count = row
    if (
        not class_group.is_public
        or class_group.status != ClassGroupStatus.OPEN
    ):
        return None
    enrolled_count = int(enrolled_count or 0)
    waitlist_count = int(waitlist_count or 0)
    available_spots = max(class_group.capacity - enrolled_count, 0)
    return {
        "capacity": class_group.capacity,
        "enrolled_count": enrolled_count,
        "available_spots": available_spots,
        "waitlist_count": waitlist_count,
        "is_full": available_spots <= 0,
        "can_join_waitlist": available_spots <= 0,
    }


async def list_class_groups(
    session: AsyncSession,
    semester_id: int | None = None,
    skill_level_id: int | None = None,
    topic_id: int | None = None,
    only_available: bool = False,
    include_waitlist: bool = False,
    limit: int = 50,
    offset: int = 0,
    sort: str | None = None,
) -> list[ClassGroupWithAvailability]:
    counts_subq = (
        select(
            Enrollment.class_group_id.label("class_group_id"),
            func.sum(
                case(
                    (Enrollment.status == EnrollmentStatus.ACTIVE, 1),
                    else_=0,
                )
            ).label("enrolled_count"),
            func.sum(
                case(
                    (Enrollment.status == EnrollmentStatus.WAITLISTED, 1),
                    else_=0,
                )
            ).label("waitlist_count"),
        )
        .group_by(Enrollment.class_group_id)
        .subquery()
    )

    query = (
        select(
            ClassGroup,
            counts_subq.c.enrolled_count,
            counts_subq.c.waitlist_count,
        )
        .outerjoin(counts_subq, counts_subq.c.class_group_id == ClassGroup.id)
        .where(
            ClassGroup.is_public.is_(True),
            ClassGroup.status == ClassGroupStatus.OPEN,
        )
    )
    query = _apply_class_group_filters(
        query, semester_id, skill_level_id, topic_id
    )
    result = await session.execute(query)
    rows = result.all()

    class_group_ids = [row[0].id for row in rows]
    next_session_map: dict[int, datetime] = {}
    if class_group_ids:
        sessions_result = await session.execute(
            select(ClassSession)
            .where(
                ClassSession.class_group_id.in_(class_group_ids),
                ClassSession.status == ClassSessionStatus.SCHEDULED,
                ClassSession.date >= date.today(),
            )
            .order_by(ClassSession.date, ClassSession.start_time)
        )
        for class_session in sessions_result.scalars():
            if class_session.class_group_id not in next_session_map:
                next_session_map[class_session.class_group_id] = (
                    datetime.combine(
                        class_session.date,
                        class_session.start_time,
                    )
                )

    items: list[ClassGroupWithAvailability] = []
    for class_group, enrolled_count, waitlist_count in rows:
        enrolled_count = int(enrolled_count or 0)
        waitlist_count = int(waitlist_count or 0)
        next_session_at = next_session_map.get(class_group.id)
        payload = _availability_payload(
            class_group, enrolled_count, waitlist_count, next_session_at
        )
        base = ClassGroupRead.model_validate(class_group)
        item = ClassGroupWithAvailability.model_validate(
            {**base.model_dump(), **payload}
        )
        if only_available and item.available_spots <= 0:
            if not include_waitlist:
                continue
        items.append(item)

    if sort == "availability":
        items.sort(key=lambda item: item.available_spots, reverse=True)
    elif sort == "next_session_at":
        items.sort(
            key=lambda item: item.next_session_at
            or datetime.max.replace(tzinfo=None)
        )
    else:
        items.sort(key=lambda item: item.name.lower())

    return items[offset : offset + limit]


async def get_class_group_with_availability(
    session: AsyncSession, class_group_id: int
) -> ClassGroupWithAvailability | None:
    availability = await get_class_group_availability(session, class_group_id)
    if availability is None:
        return None
    class_group = await session.get(ClassGroup, class_group_id)
    if (
        not class_group
        or not class_group.is_public
        or class_group.status != ClassGroupStatus.OPEN
    ):
        return None
    base = ClassGroupRead.model_validate(class_group)
    return ClassGroupWithAvailability.model_validate(
        {**base.model_dump(), **availability, "next_session_at": None}
    )
