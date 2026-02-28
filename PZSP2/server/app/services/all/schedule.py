from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.room import Room
from app.models.schedule import (
    ClassGroup,
    ClassGroupStatus,
    ClassSession,
    ClassSessionStatus,
)
from app.models.semester import SkillLevel, Topic


async def list_public_schedule(
    session: AsyncSession,
    from_date: date,
    to_date: date,
    level: str | None = None,
    topic: str | None = None,
    room_id: int | None = None,
    weekday: int | None = None,
    include_full: bool = False,
) -> dict:
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
            SkillLevel.name.label("level_name"),
            Topic.name.label("topic_name"),
            Room,
            counts_subq.c.enrolled_count,
            counts_subq.c.waitlist_count,
        )
        .join(SkillLevel, ClassGroup.level_id == SkillLevel.id)
        .join(Topic, ClassGroup.topic_id == Topic.id)
        .outerjoin(Room, ClassGroup.room_id == Room.id)
        .outerjoin(counts_subq, counts_subq.c.class_group_id == ClassGroup.id)
        .where(
            ClassGroup.is_public.is_(True),
            ClassGroup.status == ClassGroupStatus.OPEN,
        )
    )

    if level:
        query = query.where(SkillLevel.name.ilike(level))
    if topic:
        query = query.where(Topic.name.ilike(topic))
    if room_id is not None:
        query = query.where(ClassGroup.room_id == room_id)
    if weekday is not None:
        query = query.where(ClassGroup.day_of_week == weekday)

    result = await session.execute(query)
    rows = result.all()

    class_group_ids = [row[0].id for row in rows]
    occurrences_map: dict[int, list[dict]] = defaultdict(list)
    if class_group_ids:
        sessions_result = await session.execute(
            select(ClassSession)
            .where(
                ClassSession.class_group_id.in_(class_group_ids),
                ClassSession.date >= from_date,
                ClassSession.date <= to_date,
            )
            .order_by(ClassSession.date, ClassSession.start_time)
        )
        for class_session in sessions_result.scalars().all():
            occurrences_map[class_session.class_group_id].append(
                {
                    "start_at": datetime.combine(
                        class_session.date, class_session.start_time
                    ),
                    "end_at": datetime.combine(
                        class_session.date, class_session.end_time
                    ),
                    "is_cancelled": (
                        class_session.status == ClassSessionStatus.CANCELLED
                    ),
                }
            )

    groups: list[dict] = []
    for (
        class_group,
        level_name,
        topic_name,
        room,
        enrolled_count,
        waitlist_count,
    ) in rows:
        occurrences = occurrences_map.get(class_group.id, [])
        if not occurrences:
            continue
        enrolled_count = int(enrolled_count or 0)
        waitlist_count = int(waitlist_count or 0)
        available_spots = max(class_group.capacity - enrolled_count, 0)
        if not include_full and available_spots <= 0:
            continue
        groups.append(
            {
                "group_id": class_group.id,
                "name": class_group.name,
                "level": level_name,
                "topic": topic_name,
                "room": ({"id": room.id, "name": room.name} if room else None),
                "capacity": class_group.capacity,
                "enrolled_count": enrolled_count,
                "available_spots": available_spots,
                "waitlist_count": waitlist_count,
                "can_join_waitlist": available_spots <= 0,
                "occurrences": occurrences,
            }
        )

    groups.sort(key=lambda item: item["name"].lower())

    return {
        "range": {"from": from_date, "to": to_date},
        "groups": groups,
    }
