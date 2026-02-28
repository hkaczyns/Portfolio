from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_instructor_or_admin
from app.core.db import get_async_session
from app.models.user import UserRole
from app.schemas.user import UserRead
from app.services.admin import users as users_service

router = APIRouter(
    prefix="/instructor/users",
    tags=["instructor"],
    dependencies=[Depends(current_instructor_or_admin)],
)


@router.get("", response_model=list[UserRead])
async def list_users(
    role: UserRole | None = None,
    is_active: bool | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    sort_by: str = Query(default="last_name"),
    sort_order: str = Query(default="asc"),
    session: AsyncSession = Depends(get_async_session),
):
    limit = page_size
    offset = (page - 1) * page_size
    try:
        return await users_service.list_users(
            session,
            role=role,
            is_active=is_active,
            search=search,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.get("/instructors", response_model=list[UserRead])
async def list_instructors(
    session: AsyncSession = Depends(get_async_session),
):
    return await users_service.list_users_by_role(session, UserRole.INSTRUCTOR)


@router.get("/students", response_model=list[UserRead])
async def list_students(
    session: AsyncSession = Depends(get_async_session),
):
    return await users_service.list_users_by_role(session, UserRole.STUDENT)
