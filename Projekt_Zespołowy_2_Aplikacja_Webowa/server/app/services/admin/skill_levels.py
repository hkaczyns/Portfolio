from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.semester import SkillLevel
from app.schemas.skill_level import SkillLevelCreate, SkillLevelUpdate


async def list_skill_levels(session: AsyncSession) -> list[SkillLevel]:
    result = await session.execute(select(SkillLevel).order_by(SkillLevel.id))
    return list(result.scalars().all())


async def get_skill_level(
    session: AsyncSession, level_id: int
) -> SkillLevel | None:
    return await session.get(SkillLevel, level_id)


async def create_skill_level(
    session: AsyncSession, data: SkillLevelCreate
) -> SkillLevel:
    level = SkillLevel(**data.model_dump())
    session.add(level)
    await session.commit()
    await session.refresh(level)
    return level


async def update_skill_level(
    session: AsyncSession, level: SkillLevel, data: SkillLevelUpdate
) -> SkillLevel:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(level, key, value)
    await session.commit()
    await session.refresh(level)
    return level


async def delete_skill_level(session: AsyncSession, level: SkillLevel) -> None:
    await session.delete(level)
    await session.commit()
