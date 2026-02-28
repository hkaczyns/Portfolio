from __future__ import annotations

from datetime import datetime, timezone
import uuid

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance, AttendanceStatus
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.schedule import ClassSession
from app.models.user import User
from app.schemas.attendance import AttendanceBulkItem, AttendanceSelfUpdate


async def get_class_session(
    session: AsyncSession, session_id: int
) -> ClassSession | None:
    return await session.get(ClassSession, session_id)


async def list_session_attendance(
    session: AsyncSession, class_session: ClassSession
) -> list[dict]:
    result = await session.execute(
        select(Enrollment, User, Attendance)
        .join(User, Enrollment.student_id == User.id)
        .outerjoin(
            Attendance,
            and_(
                Attendance.class_session_id == class_session.id,
                Attendance.student_id == Enrollment.student_id,
            ),
        )
        .where(
            Enrollment.class_group_id == class_session.class_group_id,
            Enrollment.status == EnrollmentStatus.ACTIVE,
        )
        .order_by(User.last_name, User.first_name)
    )
    rows = result.all()
    items = []
    for enrollment, user, attendance in rows:
        items.append(
            {
                "student_id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "enrollment_status": enrollment.status,
                "attendance_id": attendance.id if attendance else None,
                "status": attendance.status if attendance else None,
                "is_makeup": attendance.is_makeup if attendance else None,
            }
        )
    return items


async def upsert_attendance_bulk(
    session: AsyncSession,
    class_session: ClassSession,
    items: list[AttendanceBulkItem],
    marked_by: uuid.UUID,
) -> list[Attendance]:
    if not items:
        return []
    student_ids = {item.student_id for item in items}
    regular_ids = {item.student_id for item in items if not item.is_makeup}
    makeup_ids = student_ids - regular_ids
    if regular_ids:
        enrollment_result = await session.execute(
            select(Enrollment).where(
                Enrollment.class_group_id == class_session.class_group_id,
                Enrollment.student_id.in_(regular_ids),
                Enrollment.status == EnrollmentStatus.ACTIVE,
            )
        )
        enrollments = {item.student_id for item in enrollment_result.scalars()}
        missing = regular_ids - enrollments
        if missing:
            raise ValueError("Some students are not enrolled in this group.")
    if makeup_ids:
        enrollment_result = await session.execute(
            select(Enrollment).where(
                Enrollment.student_id.in_(makeup_ids),
                Enrollment.status == EnrollmentStatus.ACTIVE,
            )
        )
        enrollments = {item.student_id for item in enrollment_result.scalars()}
        missing = makeup_ids - enrollments
        if missing:
            raise ValueError("Some students are not enrolled in any group.")

    attendance_result = await session.execute(
        select(Attendance).where(
            Attendance.class_session_id == class_session.id,
            Attendance.student_id.in_(student_ids),
        )
    )
    existing = {
        item.student_id: item for item in attendance_result.scalars().all()
    }
    now = datetime.now(timezone.utc)
    saved: list[Attendance] = []
    for item in items:
        attendance = existing.get(item.student_id)
        if attendance:
            attendance.status = item.status
            attendance.is_makeup = item.is_makeup
            attendance.marked_by = marked_by
            attendance.marked_at = now
        else:
            attendance = Attendance(
                class_session_id=class_session.id,
                student_id=item.student_id,
                status=item.status,
                is_makeup=item.is_makeup,
                marked_by=marked_by,
                marked_at=now,
            )
            session.add(attendance)
        saved.append(attendance)
    await session.commit()
    for attendance in saved:
        await session.refresh(attendance)
    return saved


async def upsert_attendance_single(
    session: AsyncSession,
    class_session: ClassSession,
    student_id: uuid.UUID,
    data: AttendanceSelfUpdate,
    marked_by: uuid.UUID,
) -> Attendance:
    enrollment = await session.execute(
        select(Enrollment).where(
            Enrollment.class_group_id == class_session.class_group_id,
            Enrollment.student_id == student_id,
            Enrollment.status == EnrollmentStatus.ACTIVE,
        )
    )
    if not enrollment.scalar_one_or_none():
        raise ValueError("Student is not enrolled in this group.")
    attendance = await session.execute(
        select(Attendance).where(
            Attendance.class_session_id == class_session.id,
            Attendance.student_id == student_id,
        )
    )
    attendance = attendance.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    updates = data.model_dump(exclude_unset=True)
    if attendance:
        for key, value in updates.items():
            setattr(attendance, key, value)
        attendance.marked_by = marked_by
        attendance.marked_at = now
    else:
        status = updates.get("status") or AttendanceStatus.PRESENT
        attendance = Attendance(
            class_session_id=class_session.id,
            student_id=student_id,
            status=status,
            is_makeup=updates.get("is_makeup", False),
            marked_by=marked_by,
            marked_at=now,
        )
        session.add(attendance)
    await session.commit()
    await session.refresh(attendance)
    return attendance


async def delete_attendance(
    session: AsyncSession,
    class_session: ClassSession,
    student_id: uuid.UUID,
) -> Attendance | None:
    result = await session.execute(
        select(Attendance).where(
            Attendance.class_session_id == class_session.id,
            Attendance.student_id == student_id,
        )
    )
    attendance = result.scalar_one_or_none()
    if not attendance:
        return None
    await session.delete(attendance)
    await session.commit()
    return attendance


async def set_makeup(
    session: AsyncSession,
    class_session: ClassSession,
    student_id: uuid.UUID,
    marked_by: uuid.UUID,
    value: bool,
) -> Attendance:
    enrollment = await session.execute(
        select(Enrollment).where(
            Enrollment.student_id == student_id,
            Enrollment.status == EnrollmentStatus.ACTIVE,
        )
    )
    if not enrollment.scalar_one_or_none():
        raise ValueError("Student is not enrolled in any group.")
    attendance = await session.execute(
        select(Attendance).where(
            Attendance.class_session_id == class_session.id,
            Attendance.student_id == student_id,
        )
    )
    attendance = attendance.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if not attendance:
        attendance = Attendance(
            class_session_id=class_session.id,
            student_id=student_id,
            status=AttendanceStatus.PRESENT,
            is_makeup=value,
            marked_by=marked_by,
            marked_at=now,
        )
        session.add(attendance)
    else:
        attendance.is_makeup = value
        attendance.marked_by = marked_by
        attendance.marked_at = now
    await session.commit()
    await session.refresh(attendance)
    return attendance
