from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.semester import Topic


async def list_topics(session: AsyncSession) -> list[dict]:
    result = await session.execute(select(Topic).order_by(Topic.id))
    return [{"id": topic.id, "name": topic.name} for topic in result.scalars()]
