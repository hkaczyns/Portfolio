import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_superuser
from app.core.db import get_async_session
from app.models.user import UserRole
from app.schemas.user import AdminUserDetail, UserRead
from app.services.admin import users as users_service

router = APIRouter(
    prefix="/users",
    tags=["admin"],
    dependencies=[Depends(current_superuser)],
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


@router.get("/{user_id}", response_model=AdminUserDetail)
async def get_user_details(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    user = await users_service.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    class_groups = []
    enrollments = []
    activity_stats = None
    if user.role == UserRole.INSTRUCTOR:
        class_groups = await users_service.list_instructor_class_groups(
            session, user.id
        )
        activity_stats = await users_service.get_instructor_activity_stats(
            session, user.id
        )
    elif user.role == UserRole.STUDENT:
        enrollments = await users_service.list_student_enrollments(
            session, user.id
        )
        activity_stats = await users_service.get_student_activity_stats(
            session, user.id
        )

    user_data = UserRead.model_validate(user).model_dump()
    user_data["class_groups"] = class_groups
    user_data["enrollments"] = enrollments
    user_data["activity_stats"] = activity_stats
    return user_data
