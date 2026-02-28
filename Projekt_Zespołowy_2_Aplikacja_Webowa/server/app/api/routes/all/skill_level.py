from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_async_session
from app.schemas.skill_level import SkillLevelMap
from app.services.all import skill_levels as skill_level_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/skill-levels", response_model=list[SkillLevelMap])
async def list_skill_levels(
    session: AsyncSession = Depends(get_async_session),
):
    return await skill_level_service.list_skill_levels(session)
