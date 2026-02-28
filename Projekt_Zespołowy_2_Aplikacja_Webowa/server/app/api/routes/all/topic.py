from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_async_session
from app.schemas.topic import TopicMap
from app.services.all import topic as topic_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/topics", response_model=list[TopicMap])
async def list_topics(
    session: AsyncSession = Depends(get_async_session),
):
    return await topic_service.list_topics(session)
