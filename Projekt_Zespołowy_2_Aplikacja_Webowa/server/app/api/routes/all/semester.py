from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_async_session
from app.schemas.semester import SemesterMap
from app.services.all import semesters as semester_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/semesters", response_model=list[SemesterMap])
async def list_semesters(
    session: AsyncSession = Depends(get_async_session),
):
    return await semester_service.list_semesters(session)
