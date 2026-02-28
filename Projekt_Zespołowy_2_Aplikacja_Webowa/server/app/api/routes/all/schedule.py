from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_async_session
from app.schemas.public_schedule import PublicScheduleResponse
from app.services.all import schedule as schedule_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/schedule", response_model=PublicScheduleResponse)
async def get_public_schedule(
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    level: str | None = None,
    topic: str | None = None,
    location_id: int | None = None,
    room_id: int | None = None,
    weekday: int | None = Query(default=None, ge=1, le=7),
    include_full: bool = False,
    session: AsyncSession = Depends(get_async_session),
):
    resolved_room_id = room_id if room_id is not None else location_id
    return await schedule_service.list_public_schedule(
        session,
        from_date=from_date,
        to_date=to_date,
        level=level,
        topic=topic,
        room_id=resolved_room_id,
        weekday=weekday,
        include_full=include_full,
    )
