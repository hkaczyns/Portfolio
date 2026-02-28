from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_instructor_or_admin
from app.core.db import get_async_session
from app.models.user import User
from app.schemas.calendar import CalendarEntryRead
from app.services.instructor import calendar as calendar_service

router = APIRouter(prefix="/instructor", tags=["instructor"])


@router.get("/calendar", response_model=list[CalendarEntryRead])
async def get_calendar(
    from_date: date | None = None,
    to_date: date | None = None,
    room_id: int | None = None,
    user: User = Depends(current_instructor_or_admin),
    session: AsyncSession = Depends(get_async_session),
):
    return await calendar_service.list_calendar_entries(
        session,
        instructor_id=user.id,
        from_date=from_date,
        to_date=to_date,
        room_id=room_id,
    )
