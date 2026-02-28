from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.semester import Semester


async def list_semesters(session: AsyncSession) -> list[dict]:
    result = await session.execute(select(Semester).order_by(Semester.id))
    return [
        {"id": semester.id, "name": semester.name}
        for semester in result.scalars()
    ]
