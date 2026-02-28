from __future__ import annotations

from datetime import datetime, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.email.send_email import send_enrollment_confirmation_email
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.schedule import ClassGroup, ClassGroupStatus
from app.models.user import User
from app.services.student import class_group as class_group_service


async def list_student_enrollments(
    session: AsyncSession,
    student_id: uuid.UUID,
    semester_id: int | None = None,
    status: EnrollmentStatus | None = None,
    active_only: bool = False,
) -> list[Enrollment]:
    query = select(Enrollment).where(Enrollment.student_id == student_id)
    if semester_id is not None:
        query = query.join(
            ClassGroup, Enrollment.class_group_id == ClassGroup.id
        ).where(ClassGroup.semester_id == semester_id)
    if status is not None:
        query = query.where(Enrollment.status == status)
    if active_only:
        query = query.where(Enrollment.status == EnrollmentStatus.ACTIVE)
    result = await session.execute(query.order_by(Enrollment.joined_at.desc()))
    return list(result.scalars().all())


async def get_enrollment(
    session: AsyncSession, enrollment_id: int
) -> Enrollment | None:
    return await session.get(Enrollment, enrollment_id)


async def create_student_enrollment(
    session: AsyncSession,
    student_id: uuid.UUID,
    class_group_id: int,
) -> tuple[Enrollment, dict]:
    student = await session.get(User, student_id)
    if not student:
        raise LookupError("Student not found.")
    class_group = await session.get(ClassGroup, class_group_id)
    if not class_group:
        raise LookupError("Class group not found.")
    if (
        class_group.status != ClassGroupStatus.OPEN
        or not class_group.is_public
    ):
        raise LookupError("Class group is not available for enrollment.")

    availability = await class_group_service.get_class_group_availability(
        session, class_group_id
    )
    if availability is None:
        raise LookupError("Class group not found.")

    status = (
        EnrollmentStatus.ACTIVE
        if availability["available_spots"] > 0
        else EnrollmentStatus.WAITLISTED
    )

    enrollment = Enrollment(
        student_id=student_id,
        class_group_id=class_group_id,
        status=status,
    )
    session.add(enrollment)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise ValueError("Enrollment already exists.") from exc
    await session.refresh(enrollment)
    await send_enrollment_confirmation_email(
        user=student, class_group=class_group, status=enrollment.status
    )
    return enrollment, availability


async def cancel_enrollment(
    session: AsyncSession, enrollment: Enrollment
) -> Enrollment:
    enrollment.status = EnrollmentStatus.CANCELLED
    enrollment.cancelled_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(enrollment)
    return enrollment


async def leave_waitlist(
    session: AsyncSession, enrollment: Enrollment
) -> Enrollment:
    if enrollment.status != EnrollmentStatus.WAITLISTED:
        raise ValueError("Enrollment is not on the waitlist.")
    enrollment.status = EnrollmentStatus.CANCELLED
    enrollment.cancelled_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(enrollment)
    return enrollment


async def update_self_enrollment(
    session: AsyncSession, enrollment: Enrollment, status: EnrollmentStatus
) -> Enrollment:
    if status != EnrollmentStatus.CANCELLED:
        raise ValueError("Only cancellation is allowed.")
    enrollment.status = EnrollmentStatus.CANCELLED
    enrollment.cancelled_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(enrollment)
    return enrollment
