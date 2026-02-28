import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.semester import Semester
from app.schemas.semester import SemesterCreate, SemesterUpdate


async def list_semesters(session: AsyncSession) -> list[Semester]:
    result = await session.execute(select(Semester).order_by(Semester.id))
    return list(result.scalars().all())


async def get_semester(
    session: AsyncSession, semester_id: int
) -> Semester | None:
    return await session.get(Semester, semester_id)


async def create_semester(
    session: AsyncSession, data: SemesterCreate, created_by: uuid.UUID | None
) -> Semester:
    semester = Semester(**data.model_dump(), created_by=created_by)
    session.add(semester)
    await session.commit()
    await session.refresh(semester)
    return semester


async def update_semester(
    session: AsyncSession, semester: Semester, data: SemesterUpdate
) -> Semester:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(semester, key, value)
    await session.commit()
    await session.refresh(semester)
    return semester


async def delete_semester(session: AsyncSession, semester: Semester) -> None:
    await session.delete(semester)
    await session.commit()
