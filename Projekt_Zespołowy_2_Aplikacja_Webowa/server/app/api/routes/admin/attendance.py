from datetime import date
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_superuser
from app.core.db import get_async_session
from app.models.attendance import AttendanceStatus
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceRead,
    AttendanceUpdate,
)
from app.services.admin import attendance as attendance_service

router = APIRouter(
    prefix="/attendance",
    tags=["admin"],
    dependencies=[Depends(current_superuser)],
)


@router.get("", response_model=list[AttendanceRead])
async def list_attendance(
    student_id: uuid.UUID | None = None,
    class_group_id: int | None = None,
    session_id: int | None = None,
    instructor_id: uuid.UUID | None = None,
    semester_id: int | None = None,
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    status_filter: AttendanceStatus | None = Query(
        default=None, alias="status"
    ),
    is_makeup: bool | None = None,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_async_session),
):
    return await attendance_service.list_attendance(
        session,
        student_id=student_id,
        class_group_id=class_group_id,
        session_id=session_id,
        instructor_id=instructor_id,
        semester_id=semester_id,
        from_date=from_date,
        to_date=to_date,
        status=status_filter,
        is_makeup=is_makeup,
        limit=limit,
        offset=offset,
    )


@router.get("/{attendance_id}", response_model=AttendanceRead)
async def get_attendance(
    attendance_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    attendance = await attendance_service.get_attendance(
        session, attendance_id
    )
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance not found.",
        )
    return attendance


@router.post(
    "",
    response_model=AttendanceRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_attendance(
    payload: AttendanceCreate,
    session: AsyncSession = Depends(get_async_session),
):
    return await attendance_service.create_attendance(session, payload)


@router.patch("/{attendance_id}", response_model=AttendanceRead)
async def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    attendance = await attendance_service.get_attendance(
        session, attendance_id
    )
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance not found.",
        )
    return await attendance_service.update_attendance(
        session, attendance, payload
    )


@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_attendance(
    attendance_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    attendance = await attendance_service.get_attendance(
        session, attendance_id
    )
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance not found.",
        )
    await attendance_service.delete_attendance(session, attendance)
