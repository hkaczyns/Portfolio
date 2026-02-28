from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_user
from app.core.db import get_async_session
from app.schemas.class_group import (
    ClassGroupAvailabilityRead,
    ClassGroupWithAvailability,
)
from app.services.student import class_group as class_group_service

router = APIRouter(tags=["student"], dependencies=[Depends(current_user)])


@router.get("/class-groups", response_model=list[ClassGroupWithAvailability])
async def list_class_groups(
    semester_id: int | None = None,
    skill_level_id: int | None = None,
    topic_id: int | None = None,
    only_available: bool = False,
    include_waitlist: bool = False,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    sort: str | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    return await class_group_service.list_class_groups(
        session,
        semester_id=semester_id,
        skill_level_id=skill_level_id,
        topic_id=topic_id,
        only_available=only_available,
        include_waitlist=include_waitlist,
        limit=limit,
        offset=offset,
        sort=sort,
    )


@router.get(
    "/class-groups/{class_group_id}",
    response_model=ClassGroupWithAvailability,
)
async def get_class_group(
    class_group_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    class_group = await class_group_service.get_class_group_with_availability(
        session, class_group_id
    )
    if not class_group or not class_group.is_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class group not found.",
        )
    return class_group


@router.get(
    "/class-groups/{class_group_id}/availability",
    response_model=ClassGroupAvailabilityRead,
)
async def get_class_group_availability(
    class_group_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    availability = await class_group_service.get_class_group_availability(
        session, class_group_id
    )
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class group not found.",
        )
    return availability
