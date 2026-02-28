from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_student
from app.core.db import get_async_session
from app.models.enrollment import EnrollmentStatus
from app.models.user import User
from app.schemas.enrollment import (
    EnrollmentRead,
    EnrollmentSelfCreate,
    EnrollmentSelfUpdate,
    EnrollmentWithAvailability,
)
from app.services.student import enrollment as enrollment_service

router = APIRouter(prefix="/me", tags=["student"])


@router.get("/enrollments", response_model=list[EnrollmentRead])
async def list_enrollments(
    semester_id: int | None = None,
    status_filter: EnrollmentStatus | None = Query(
        default=None, alias="status"
    ),
    active_only: bool = False,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    return await enrollment_service.list_student_enrollments(
        session,
        student_id=user.id,
        semester_id=semester_id,
        status=status_filter,
        active_only=active_only,
    )


@router.post(
    "/enrollments",
    response_model=EnrollmentWithAvailability,
    status_code=status.HTTP_201_CREATED,
)
async def create_enrollment(
    payload: EnrollmentSelfCreate,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    try:
        enrollment, availability = (
            await enrollment_service.create_student_enrollment(
                session,
                student_id=user.id,
                class_group_id=payload.class_group_id,
            )
        )
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc
    return {"enrollment": enrollment, "availability": availability}


@router.post(
    "/enrollments/{enrollment_id}/cancel",
    response_model=EnrollmentRead,
)
async def cancel_enrollment(
    enrollment_id: int,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    enrollment = await enrollment_service.get_enrollment(
        session, enrollment_id
    )
    if not enrollment or enrollment.student_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found.",
        )
    return await enrollment_service.cancel_enrollment(session, enrollment)


@router.patch(
    "/enrollments/{enrollment_id}",
    response_model=EnrollmentRead,
)
async def update_enrollment(
    enrollment_id: int,
    payload: EnrollmentSelfUpdate,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    enrollment = await enrollment_service.get_enrollment(
        session, enrollment_id
    )
    if not enrollment or enrollment.student_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found.",
        )
    if payload.status is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes provided.",
        )
    try:
        return await enrollment_service.update_self_enrollment(
            session, enrollment, payload.status
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.post(
    "/enrollments/{enrollment_id}/leave-waitlist",
    response_model=EnrollmentRead,
)
async def leave_waitlist(
    enrollment_id: int,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    enrollment = await enrollment_service.get_enrollment(
        session, enrollment_id
    )
    if not enrollment or enrollment.student_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found.",
        )
    try:
        return await enrollment_service.leave_waitlist(session, enrollment)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
