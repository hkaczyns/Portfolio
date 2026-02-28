from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_student
from app.core.db import get_async_session
from app.models.attendance import AttendanceStatus
from app.models.user import User
from app.schemas.attendance import (
    StudentAttendanceItem,
    StudentAttendanceSummary,
)
from app.services.student import attendance as attendance_service

router = APIRouter(prefix="/me", tags=["student"])


@router.get("/attendance", response_model=list[StudentAttendanceItem])
async def list_attendance(
    semester_id: int | None = None,
    class_group_id: int | None = None,
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    status_filter: AttendanceStatus | None = Query(
        default=None, alias="status"
    ),
    is_makeup: bool | None = None,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    return await attendance_service.list_student_attendance(
        session,
        student_id=user.id,
        semester_id=semester_id,
        class_group_id=class_group_id,
        from_date=from_date,
        to_date=to_date,
        status=status_filter,
        is_makeup=is_makeup,
        limit=limit,
        offset=offset,
    )


@router.get("/attendance/summary", response_model=StudentAttendanceSummary)
async def attendance_summary(
    semester_id: int | None = None,
    class_group_id: int | None = None,
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    status_filter: AttendanceStatus | None = Query(
        default=None, alias="status"
    ),
    is_makeup: bool | None = None,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    return await attendance_service.summarize_student_attendance(
        session,
        student_id=user.id,
        semester_id=semester_id,
        class_group_id=class_group_id,
        from_date=from_date,
        to_date=to_date,
        status=status_filter,
        is_makeup=is_makeup,
    )
