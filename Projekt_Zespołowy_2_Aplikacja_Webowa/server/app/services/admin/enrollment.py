from __future__ import annotations

from datetime import datetime, timezone
import uuid

from sqlalchemy import case, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.schedule import ClassGroup
from app.models.package import UserPackage


async def list_enrollments(
    session: AsyncSession,
    class_group_id: int | None = None,
    student_id: uuid.UUID | None = None,
    status: EnrollmentStatus | None = None,
    semester_id: int | None = None,
) -> list[Enrollment]:
    query = select(Enrollment)
    if semester_id is not None:
        query = query.join(
            ClassGroup, Enrollment.class_group_id == ClassGroup.id
        ).where(ClassGroup.semester_id == semester_id)
    if class_group_id is not None:
        query = query.where(Enrollment.class_group_id == class_group_id)
    if student_id is not None:
        query = query.where(Enrollment.student_id == student_id)
    if status is not None:
        query = query.where(Enrollment.status == status)
    result = await session.execute(query.order_by(Enrollment.joined_at.desc()))
    return list(result.scalars().all())


async def get_enrollment(
    session: AsyncSession, enrollment_id: int
) -> Enrollment | None:
    return await session.get(Enrollment, enrollment_id)


async def create_enrollment(
    session: AsyncSession,
    student_id: uuid.UUID,
    class_group_id: int,
    status: EnrollmentStatus | None = None,
) -> Enrollment:
    enrollment = Enrollment(
        student_id=student_id,
        class_group_id=class_group_id,
        status=status or EnrollmentStatus.ACTIVE,
    )
    session.add(enrollment)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise ValueError("Enrollment already exists.") from exc
    await session.refresh(enrollment)
    return enrollment


async def update_enrollment(
    session: AsyncSession, enrollment: Enrollment, status: EnrollmentStatus
) -> Enrollment:
    enrollment.status = status
    if status == EnrollmentStatus.CANCELLED:
        enrollment.cancelled_at = datetime.now(timezone.utc)
    else:
        enrollment.cancelled_at = None
    await session.commit()
    await session.refresh(enrollment)
    return enrollment


async def delete_enrollment(
    session: AsyncSession, enrollment: Enrollment
) -> None:
    await session.execute(
        update(UserPackage)
        .where(UserPackage.enrollment_id == enrollment.id)
        .values(enrollment_id=None)
    )
    await session.delete(enrollment)
    await session.commit()


async def promote_waitlist(
    session: AsyncSession, class_group_id: int
) -> Enrollment | None:
    counts = await session.execute(
        select(
            func.coalesce(
                func.sum(
                    case(
                        (Enrollment.status == EnrollmentStatus.ACTIVE, 1),
                        else_=0,
                    )
                ),
                0,
            ).label("active_count")
        ).where(Enrollment.class_group_id == class_group_id)
    )
    active_count = int(counts.scalar() or 0)
    class_group = await session.get(ClassGroup, class_group_id)
    if not class_group:
        return None
    if active_count >= class_group.capacity:
        return None

    result = await session.execute(
        select(Enrollment)
        .where(
            Enrollment.class_group_id == class_group_id,
            Enrollment.status == EnrollmentStatus.WAITLISTED,
        )
        .order_by(Enrollment.joined_at.asc())
        .limit(1)
    )
    enrollment = result.scalar_one_or_none()
    if not enrollment:
        return None
    enrollment.status = EnrollmentStatus.ACTIVE
    enrollment.cancelled_at = None
    await session.commit()
    await session.refresh(enrollment)
    return enrollment
