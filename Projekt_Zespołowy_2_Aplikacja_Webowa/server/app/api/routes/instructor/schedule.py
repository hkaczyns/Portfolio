from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_instructor_or_admin
from app.core.db import get_async_session
from app.models.user import User, UserRole
from app.schemas.class_session import ClassSessionComplete, ClassSessionRead
from app.schemas.instructor_substitution import (
    InstructorSubstitutionCreate,
    InstructorSubstitutionRead,
)
from app.services.admin import class_sessions

router = APIRouter(prefix="/instructor/schedule", tags=["instructor"])


async def _get_class_session_or_404(
    class_session_id: int,
    user: User,
    session: AsyncSession,
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
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


async def _get_substitution_or_404(
    substitution_id: int,
    user: User,
    session: AsyncSession,
):
    substitution = await class_sessions.get_substitution(
        session, substitution_id
    )
    if not substitution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Substitution not found.",
        )
    class_session = await class_sessions.get_class_session(
        session, substitution.class_session_id
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
    return substitution, class_session


@router.post(
    "/class-sessions/{class_session_id}/complete",
    response_model=ClassSessionRead,
)
async def complete_class_session(
    class_session_id: int,
    payload: ClassSessionComplete,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_class_session_or_404(
        class_session_id, user, session
    )
    return await class_sessions.complete_class_session(
        session, class_session, payload.notes
    )


@router.post(
    "/class-sessions/{class_session_id}/substitutions",
    response_model=InstructorSubstitutionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_substitution(
    class_session_id: int,
    payload: InstructorSubstitutionCreate,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await _get_class_session_or_404(
        class_session_id, user, session
    )
    try:
        return await class_sessions.create_substitution(
            session,
            class_session,
            payload.substitute_instructor_id,
            payload.reason,
            created_by=user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.delete(
    "/substitutions/{substitution_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_substitution(
    substitution_id: int,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    substitution, _class_session = await _get_substitution_or_404(
        substitution_id, user, session
    )
    await class_sessions.delete_substitution(session, substitution)
