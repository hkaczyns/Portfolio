import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_instructor_or_admin
from app.core.db import get_async_session
from app.models.user import User, UserRole
from app.schemas.attendance import (
    AttendanceBulkCreate,
    AttendanceRead,
    AttendanceSelfUpdate,
    SessionAttendanceStudent,
)
from app.services.instructor import session as session_service

router = APIRouter(prefix="/instructor", tags=["instructor"])


async def _get_session_or_404(
    session_id: int,
    user: User,
    session: AsyncSession,
):
    class_session = await session_service.get_class_session(
        session, session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    if (
        user.role == UserRole.INSTRUCTOR
        and class_session.instructor_id != user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions.",
        )
    return class_session


@router.get(
    "/sessions/{session_id}/attendance",
    response_model=list[SessionAttendanceStudent],
)
async def list_session_attendance(
    session_id: int,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_session_or_404(session_id, user, session)
    return await session_service.list_session_attendance(
        session, class_session
    )


@router.post(
    "/sessions/{session_id}/attendance",
    response_model=list[AttendanceRead],
)
async def bulk_update_attendance(
    session_id: int,
    payload: AttendanceBulkCreate,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_session_or_404(session_id, user, session)
    try:
        return await session_service.upsert_attendance_bulk(
            session, class_session, payload.items, marked_by=user.id
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.patch(
    "/sessions/{session_id}/attendance/{student_id}",
    response_model=AttendanceRead,
)
async def update_attendance(
    session_id: int,
    student_id: uuid.UUID,
    payload: AttendanceSelfUpdate,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_session_or_404(session_id, user, session)
    try:
        return await session_service.upsert_attendance_single(
            session, class_session, student_id, payload, marked_by=user.id
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.delete(
    "/sessions/{session_id}/attendance/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_attendance(
    session_id: int,
    student_id: uuid.UUID,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_session_or_404(session_id, user, session)
    attendance = await session_service.delete_attendance(
        session, class_session, student_id
    )
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance not found.",
        )


@router.post(
    "/sessions/{session_id}/makeup/{student_id}",
    response_model=AttendanceRead,
)
async def mark_makeup(
    session_id: int,
    student_id: uuid.UUID,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_session_or_404(session_id, user, session)
    try:
        return await session_service.set_makeup(
            session, class_session, student_id, user.id, True
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.delete(
    "/sessions/{session_id}/makeup/{student_id}",
    response_model=AttendanceRead,
)
async def unmark_makeup(
    session_id: int,
    student_id: uuid.UUID,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_session_or_404(session_id, user, session)
    try:
        return await session_service.set_makeup(
            session, class_session, student_id, user.id, False
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
