from datetime import date
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_superuser
from app.core.db import get_async_session
from app.schemas.calendar import CalendarEntryRead
from app.services.admin import calendar as calendar_service

router = APIRouter(
    prefix="/schedule",
    tags=["admin"],
    dependencies=[Depends(current_superuser)],
)


@router.get("/calendar", response_model=list[CalendarEntryRead])
async def get_calendar(
    from_date: date | None = None,
    to_date: date | None = None,
    room_id: int | None = None,
    instructor_id: uuid.UUID | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    return await calendar_service.list_calendar_entries(
        session,
        from_date=from_date,
        to_date=to_date,
        room_id=room_id,
        instructor_id=instructor_id,
    )
