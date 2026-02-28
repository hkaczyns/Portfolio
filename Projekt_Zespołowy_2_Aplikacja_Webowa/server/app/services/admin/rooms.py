from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.schemas.room import RoomCreate, RoomUpdate


async def list_rooms(session: AsyncSession) -> list[Room]:
    result = await session.execute(select(Room).order_by(Room.id))
    return list(result.scalars().all())


async def get_room(session: AsyncSession, room_id: int) -> Room | None:
    return await session.get(Room, room_id)


async def create_room(session: AsyncSession, data: RoomCreate) -> Room:
    room = Room(**data.model_dump())
    session.add(room)
    await session.commit()
    await session.refresh(room)
    return room


async def update_room(
    session: AsyncSession, room: Room, data: RoomUpdate
) -> Room:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(room, key, value)
    await session.commit()
    await session.refresh(room)
    return room


async def delete_room(session: AsyncSession, room: Room) -> None:
    await session.delete(room)
    await session.commit()
