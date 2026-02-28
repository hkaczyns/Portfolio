from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.semester import Topic
from app.schemas.topic import TopicCreate, TopicUpdate


async def list_topics(session: AsyncSession) -> list[Topic]:
    result = await session.execute(select(Topic).order_by(Topic.id))
    return list(result.scalars().all())


async def get_topic(session: AsyncSession, topic_id: int) -> Topic | None:
    return await session.get(Topic, topic_id)


async def create_topic(session: AsyncSession, data: TopicCreate) -> Topic:
    topic = Topic(**data.model_dump())
    session.add(topic)
    await session.commit()
    await session.refresh(topic)
    return topic


async def update_topic(
    session: AsyncSession, topic: Topic, data: TopicUpdate
) -> Topic:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(topic, key, value)
    await session.commit()
    await session.refresh(topic)
    return topic


async def delete_topic(session: AsyncSession, topic: Topic) -> None:
    await session.delete(topic)
    await session.commit()
