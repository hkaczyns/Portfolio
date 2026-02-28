from __future__ import annotations

import uuid

from sqlalchemy import case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.schedule import ClassGroup, ClassSession
from app.models.user import User, UserRole
from app.services.student import attendance as student_attendance

USER_TABLE = User.__table__

_SORT_FIELDS = {
    "email": USER_TABLE.c.email,
    "first_name": USER_TABLE.c.first_name,
    "last_name": USER_TABLE.c.last_name,
    "role": USER_TABLE.c.role,
    "is_active": USER_TABLE.c.is_active,
    "is_verified": USER_TABLE.c.is_verified,
}


def _resolve_sort(sort_by: str, sort_order: str):
    sort_column = _SORT_FIELDS.get(sort_by)
    if sort_column is None:
        raise ValueError("Invalid sort_by value.")
    order = sort_order.lower()
    if order not in {"asc", "desc"}:
        raise ValueError("Invalid sort_order value.")
    return sort_column.asc() if order == "asc" else sort_column.desc()


async def list_users(
    session: AsyncSession,
    role: UserRole | None = None,
    is_active: bool | None = None,
    search: str | None = None,
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "last_name",
    sort_order: str = "asc",
) -> list[User]:
    query = select(User)
    if role is not None:
        query = query.where(USER_TABLE.c.role == role)
    if is_active is not None:
        query = query.where(USER_TABLE.c.is_active.is_(is_active))
    if search:
        search = search.strip()
        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(
                    USER_TABLE.c.email.ilike(pattern),
                    USER_TABLE.c.first_name.ilike(pattern),
                    USER_TABLE.c.last_name.ilike(pattern),
                )
            )
    order_clause = _resolve_sort(sort_by, sort_order)
    query = (
        query.order_by(order_clause, USER_TABLE.c.id)
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(query)
    return list(result.scalars().all())


async def list_users_by_role(
    session: AsyncSession, role: UserRole
) -> list[User]:
    result = await session.execute(
        select(User)
        .where(USER_TABLE.c.role == role)
        .order_by(
            USER_TABLE.c.last_name,
            USER_TABLE.c.first_name,
            USER_TABLE.c.id,
        )
    )
    return list(result.scalars().all())


async def get_user(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await session.get(User, user_id)


async def list_instructor_class_groups(
    session: AsyncSession, instructor_id: uuid.UUID
) -> list[ClassGroup]:
    result = await session.execute(
        select(ClassGroup)
        .where(ClassGroup.instructor_id == instructor_id)
        .order_by(ClassGroup.name, ClassGroup.id)
    )
    return list(result.scalars().all())


async def list_student_enrollments(
    session: AsyncSession, student_id: uuid.UUID
) -> list[Enrollment]:
    result = await session.execute(
        select(Enrollment)
        .where(Enrollment.student_id == student_id)
        .order_by(Enrollment.joined_at.desc())
    )
    return list(result.scalars().all())


async def get_student_activity_stats(
    session: AsyncSession, student_id: uuid.UUID
) -> dict:
    result = await session.execute(
        select(
            func.count(Enrollment.id).label("total_count"),
            func.sum(
                case(
                    (Enrollment.status == EnrollmentStatus.ACTIVE, 1),
                    else_=0,
                )
            ).label("active_count"),
        ).where(Enrollment.student_id == student_id)
    )
    row = result.one()
    summary = await student_attendance.summarize_student_attendance(
        session, student_id
    )
    return {
        "enrollments_total": int(row.total_count or 0),
        "enrollments_active": int(row.active_count or 0),
        "attendance_summary": summary,
    }


async def get_instructor_activity_stats(
    session: AsyncSession, instructor_id: uuid.UUID
) -> dict:
    class_groups_count = await session.scalar(
        select(func.count(ClassGroup.id)).where(
            ClassGroup.instructor_id == instructor_id
        )
    )
    class_sessions_count = await session.scalar(
        select(func.count(ClassSession.id)).where(
            ClassSession.instructor_id == instructor_id
        )
    )
    return {
        "class_groups_total": int(class_groups_count or 0),
        "class_sessions_total": int(class_sessions_count or 0),
    }
