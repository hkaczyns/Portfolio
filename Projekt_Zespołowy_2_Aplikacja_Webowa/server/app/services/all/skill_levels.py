from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.semester import SkillLevel


async def list_skill_levels(session: AsyncSession) -> list[dict]:
    result = await session.execute(select(SkillLevel).order_by(SkillLevel.id))
    return [{"id": level.id, "name": level.name} for level in result.scalars()]
