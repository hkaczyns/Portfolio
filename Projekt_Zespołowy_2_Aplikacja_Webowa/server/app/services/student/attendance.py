from __future__ import annotations

from datetime import date
import uuid

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance, AttendanceStatus
from app.models.schedule import ClassGroup, ClassSession


async def list_student_attendance(
    session: AsyncSession,
    student_id: uuid.UUID,
    semester_id: int | None = None,
    class_group_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    status: AttendanceStatus | None = None,
    is_makeup: bool | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict]:
    query = (
        select(Attendance, ClassSession, ClassGroup)
        .join(ClassSession, Attendance.class_session_id == ClassSession.id)
        .join(ClassGroup, ClassSession.class_group_id == ClassGroup.id)
        .where(Attendance.student_id == student_id)
    )
    if semester_id is not None:
        query = query.where(ClassGroup.semester_id == semester_id)
    if class_group_id is not None:
        query = query.where(ClassGroup.id == class_group_id)
    if from_date is not None:
        query = query.where(ClassSession.date >= from_date)
    if to_date is not None:
        query = query.where(ClassSession.date <= to_date)
    if status is not None:
        query = query.where(Attendance.status == status)
    if is_makeup is not None:
        query = query.where(Attendance.is_makeup.is_(is_makeup))
    query = query.order_by(ClassSession.date.desc(), ClassSession.start_time)
    query = query.offset(offset).limit(limit)
    result = await session.execute(query)
    items = []
    for attendance, class_session, class_group in result.all():
        items.append(
            {
                "attendance_id": attendance.id,
                "class_session_id": class_session.id,
                "class_group_id": class_group.id,
                "class_group_name": class_group.name,
                "date": class_session.date,
                "start_time": class_session.start_time,
                "end_time": class_session.end_time,
                "room_id": class_session.room_id,
                "status": attendance.status,
                "is_makeup": attendance.is_makeup,
            }
        )
    return items


async def summarize_student_attendance(
    session: AsyncSession,
    student_id: uuid.UUID,
    semester_id: int | None = None,
    class_group_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    status: AttendanceStatus | None = None,
    is_makeup: bool | None = None,
) -> dict:
    query = (
        select(
            func.count(Attendance.id).label("total_count"),
            func.sum(
                case(
                    (Attendance.status == AttendanceStatus.PRESENT, 1),
                    else_=0,
                )
            ).label("present_count"),
            func.sum(
                case(
                    (Attendance.status == AttendanceStatus.ABSENT, 1),
                    else_=0,
                )
            ).label("absent_count"),
            func.sum(
                case(
                    (Attendance.status == AttendanceStatus.EXCUSED, 1),
                    else_=0,
                )
            ).label("excused_count"),
            func.sum(case((Attendance.is_makeup.is_(True), 1), else_=0)).label(
                "makeup_count"
            ),
        )
        .join(ClassSession, Attendance.class_session_id == ClassSession.id)
        .join(ClassGroup, ClassSession.class_group_id == ClassGroup.id)
        .where(Attendance.student_id == student_id)
    )
    if semester_id is not None:
        query = query.where(ClassGroup.semester_id == semester_id)
    if class_group_id is not None:
        query = query.where(ClassGroup.id == class_group_id)
    if from_date is not None:
        query = query.where(ClassSession.date >= from_date)
    if to_date is not None:
        query = query.where(ClassSession.date <= to_date)
    if status is not None:
        query = query.where(Attendance.status == status)
    if is_makeup is not None:
        query = query.where(Attendance.is_makeup.is_(is_makeup))
    result = await session.execute(query)
    row = result.one()
    total_count = int(row.total_count or 0)
    present_count = int(row.present_count or 0)
    absent_count = int(row.absent_count or 0)
    excused_count = int(row.excused_count or 0)
    makeup_count = int(row.makeup_count or 0)
    attendance_rate = present_count / total_count if total_count > 0 else None
    return {
        "total_count": total_count,
        "present_count": present_count,
        "absent_count": absent_count,
        "excused_count": excused_count,
        "makeup_count": makeup_count,
        "attendance_rate": attendance_rate,
    }
