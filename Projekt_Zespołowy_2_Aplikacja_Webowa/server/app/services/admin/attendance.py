from __future__ import annotations

from datetime import date
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance, AttendanceStatus
from app.models.schedule import ClassGroup, ClassSession
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate


async def list_attendance(
    session: AsyncSession,
    student_id: uuid.UUID | None = None,
    class_group_id: int | None = None,
    session_id: int | None = None,
    instructor_id: uuid.UUID | None = None,
    semester_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    status: AttendanceStatus | None = None,
    is_makeup: bool | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Attendance]:
    query = select(Attendance).join(
        ClassSession, Attendance.class_session_id == ClassSession.id
    )
    if class_group_id is not None:
        query = query.where(ClassSession.class_group_id == class_group_id)
    if session_id is not None:
        query = query.where(Attendance.class_session_id == session_id)
    if instructor_id is not None:
        query = query.where(ClassSession.instructor_id == instructor_id)
    if semester_id is not None:
        query = query.join(
            ClassGroup, ClassSession.class_group_id == ClassGroup.id
        ).where(ClassGroup.semester_id == semester_id)
    if student_id is not None:
        query = query.where(Attendance.student_id == student_id)
    if from_date is not None:
        query = query.where(ClassSession.date >= from_date)
    if to_date is not None:
        query = query.where(ClassSession.date <= to_date)
    if status is not None:
        query = query.where(Attendance.status == status)
    if is_makeup is not None:
        query = query.where(Attendance.is_makeup.is_(is_makeup))
    query = query.order_by(ClassSession.date.desc(), Attendance.id.desc())
    query = query.offset(offset).limit(limit)
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_attendance(
    session: AsyncSession, attendance_id: int
) -> Attendance | None:
    return await session.get(Attendance, attendance_id)


async def create_attendance(
    session: AsyncSession, data: AttendanceCreate
) -> Attendance:
    attendance = Attendance(**data.model_dump())
    session.add(attendance)
    await session.commit()
    await session.refresh(attendance)
    return attendance


async def update_attendance(
    session: AsyncSession, attendance: Attendance, data: AttendanceUpdate
) -> Attendance:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(attendance, key, value)
    await session.commit()
    await session.refresh(attendance)
    return attendance


async def delete_attendance(
    session: AsyncSession, attendance: Attendance
) -> None:
    await session.delete(attendance)
    await session.commit()
