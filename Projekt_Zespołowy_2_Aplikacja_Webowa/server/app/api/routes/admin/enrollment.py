import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_superuser
from app.core.db import get_async_session
from app.models.enrollment import EnrollmentStatus
from app.schemas.enrollment import (
    EnrollmentCreate,
    EnrollmentRead,
    EnrollmentUpdate,
)
from app.services.admin import enrollment as enrollment_service

router = APIRouter(
    tags=["admin"],
    dependencies=[Depends(current_superuser)],
)


@router.get("/enrollments", response_model=list[EnrollmentRead])
async def list_enrollments(
    class_group_id: int | None = None,
    student_id: uuid.UUID | None = None,
    status_filter: EnrollmentStatus | None = Query(
        default=None, alias="status"
    ),
    semester_id: int | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    return await enrollment_service.list_enrollments(
        session,
        class_group_id=class_group_id,
        student_id=student_id,
        status=status_filter,
        semester_id=semester_id,
    )


@router.post(
    "/enrollments",
    response_model=EnrollmentRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_enrollment(
    payload: EnrollmentCreate,
    session: AsyncSession = Depends(get_async_session),
):
    try:
        return await enrollment_service.create_enrollment(
            session,
            student_id=payload.student_id,
            class_group_id=payload.class_group_id,
            status=payload.status,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.patch(
    "/enrollments/{enrollment_id}",
    response_model=EnrollmentRead,
)
async def update_enrollment(
    enrollment_id: int,
    payload: EnrollmentUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    enrollment = await enrollment_service.get_enrollment(
        session, enrollment_id
    )
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found.",
        )
    if payload.status is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided.",
        )
    return await enrollment_service.update_enrollment(
        session, enrollment, payload.status
    )


@router.delete(
    "/enrollments/{enrollment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_enrollment(
    enrollment_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    enrollment = await enrollment_service.get_enrollment(
        session, enrollment_id
    )
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found.",
        )
    await enrollment_service.delete_enrollment(session, enrollment)


@router.post(
    "/class-groups/{class_group_id}/waitlist/promote",
    response_model=EnrollmentRead,
)
async def promote_waitlist(
    class_group_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    enrollment = await enrollment_service.promote_waitlist(
        session, class_group_id
    )
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No waitlisted enrollment to promote.",
        )
    return enrollment
