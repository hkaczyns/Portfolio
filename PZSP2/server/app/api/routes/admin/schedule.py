from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_superuser
from app.core.db import get_async_session
from app.models.user import User
from app.models.schedule import ClassSessionStatus
from app.schemas.class_group import (
    ClassGroupCreate,
    ClassGroupRead,
    ClassGroupUpdate,
)
from app.schemas.class_session import (
    ClassGroupGenerateSessions,
    ClassSessionBulkCancel,
    ClassSessionBulkUpdate,
    ClassSessionCancel,
    ClassSessionComplete,
    ClassSessionCreate,
    ClassSessionRead,
    ClassSessionReschedule,
    ClassSessionUpdate,
)
from app.schemas.instructor_substitution import (
    InstructorSubstitutionCreate,
    InstructorSubstitutionRead,
)
from app.schemas.room import RoomCreate, RoomRead, RoomUpdate
from app.schemas.semester import SemesterCreate, SemesterRead, SemesterUpdate
from app.schemas.skill_level import (
    SkillLevelCreate,
    SkillLevelRead,
    SkillLevelUpdate,
)
from app.schemas.topic import TopicCreate, TopicRead, TopicUpdate
from app.services.admin import (
    class_groups,
    class_sessions,
    rooms,
    semesters,
    skill_levels,
    topics,
)

router = APIRouter(
    prefix="/schedule",
    tags=["admin"],
    dependencies=[Depends(current_superuser)],
)


@router.get("/rooms", response_model=list[RoomRead])
async def list_rooms(
    session: AsyncSession = Depends(get_async_session),
):
    return await rooms.list_rooms(session)


@router.post(
    "/rooms",
    response_model=RoomRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_room(
    room_create: RoomCreate,
    session: AsyncSession = Depends(get_async_session),
):
    return await rooms.create_room(session, room_create)


@router.patch("/rooms/{room_id}", response_model=RoomRead)
async def update_room(
    room_id: int,
    room_update: RoomUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    room = await rooms.get_room(session, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Room not found."
        )
    return await rooms.update_room(session, room, room_update)


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    room = await rooms.get_room(session, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Room not found."
        )
    await rooms.delete_room(session, room)


@router.get("/skill-levels", response_model=list[SkillLevelRead])
async def list_skill_levels(
    session: AsyncSession = Depends(get_async_session),
):
    return await skill_levels.list_skill_levels(session)


@router.post(
    "/skill-levels",
    response_model=SkillLevelRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_skill_level(
    skill_level_create: SkillLevelCreate,
    session: AsyncSession = Depends(get_async_session),
):
    return await skill_levels.create_skill_level(session, skill_level_create)


@router.patch("/skill-levels/{level_id}", response_model=SkillLevelRead)
async def update_skill_level(
    level_id: int,
    skill_level_update: SkillLevelUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    level = await skill_levels.get_skill_level(session, level_id)
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill level not found.",
        )
    return await skill_levels.update_skill_level(
        session, level, skill_level_update
    )


@router.delete(
    "/skill-levels/{level_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_skill_level(
    level_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    level = await skill_levels.get_skill_level(session, level_id)
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill level not found.",
        )
    await skill_levels.delete_skill_level(session, level)


@router.get("/topics", response_model=list[TopicRead])
async def list_topics(
    session: AsyncSession = Depends(get_async_session),
):
    return await topics.list_topics(session)


@router.post(
    "/topics",
    response_model=TopicRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_topic(
    topic_create: TopicCreate,
    session: AsyncSession = Depends(get_async_session),
):
    return await topics.create_topic(session, topic_create)


@router.patch("/topics/{topic_id}", response_model=TopicRead)
async def update_topic(
    topic_id: int,
    topic_update: TopicUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    topic = await topics.get_topic(session, topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found."
        )
    return await topics.update_topic(session, topic, topic_update)


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    topic = await topics.get_topic(session, topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found."
        )
    await topics.delete_topic(session, topic)


@router.get("/semesters", response_model=list[SemesterRead])
async def list_semesters(
    session: AsyncSession = Depends(get_async_session),
):
    return await semesters.list_semesters(session)


@router.post(
    "/semesters",
    response_model=SemesterRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_semester(
    semester_create: SemesterCreate,
    user: User = Depends(current_superuser),
    session: AsyncSession = Depends(get_async_session),
):
    return await semesters.create_semester(
        session, semester_create, created_by=user.id
    )


@router.patch("/semesters/{semester_id}", response_model=SemesterRead)
async def update_semester(
    semester_id: int,
    semester_update: SemesterUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    semester = await semesters.get_semester(session, semester_id)
    if not semester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Semester not found.",
        )
    return await semesters.update_semester(session, semester, semester_update)


@router.delete(
    "/semesters/{semester_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_semester(
    semester_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    semester = await semesters.get_semester(session, semester_id)
    if not semester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Semester not found.",
        )
    await semesters.delete_semester(session, semester)


@router.get("/class-groups", response_model=list[ClassGroupRead])
async def list_class_groups(
    session: AsyncSession = Depends(get_async_session),
):
    return await class_groups.list_class_groups(session)


@router.get("/class-groups/{class_group_id}", response_model=ClassGroupRead)
async def get_class_group(
    class_group_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    class_group = await class_groups.get_class_group(session, class_group_id)
    if not class_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class group not found.",
        )
    return class_group


@router.post(
    "/class-groups",
    response_model=ClassGroupRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_class_group(
    class_group_create: ClassGroupCreate,
    session: AsyncSession = Depends(get_async_session),
):
    return await class_groups.create_class_group(session, class_group_create)


@router.patch("/class-groups/{class_group_id}", response_model=ClassGroupRead)
async def update_class_group(
    class_group_id: int,
    class_group_update: ClassGroupUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    class_group = await class_groups.get_class_group(session, class_group_id)
    if not class_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class group not found.",
        )
    return await class_groups.update_class_group(
        session, class_group, class_group_update
    )


@router.delete(
    "/class-groups/{class_group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_class_group(
    class_group_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    class_group = await class_groups.get_class_group(session, class_group_id)
    if not class_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class group not found.",
        )
    await class_groups.delete_class_group(session, class_group)


@router.post(
    "/class-groups/{class_group_id}/generate-sessions",
    response_model=list[ClassSessionRead],
    status_code=status.HTTP_201_CREATED,
)
async def generate_class_group_sessions(
    class_group_id: int,
    payload: ClassGroupGenerateSessions,
    session: AsyncSession = Depends(get_async_session),
):
    class_group = await class_groups.get_class_group(session, class_group_id)
    if not class_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class group not found.",
        )
    if payload.start_date > payload.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date.",
        )
    try:
        return await class_groups.generate_sessions(
            session, class_group, payload
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.delete(
    "/class-groups/{class_group_id}/sessions",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_class_group_sessions(
    class_group_id: int,
    from_date: date,
    to_date: date,
    session: AsyncSession = Depends(get_async_session),
):
    class_group = await class_groups.get_class_group(session, class_group_id)
    if not class_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class group not found.",
        )
    if from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date.",
        )
    await class_groups.delete_class_group_sessions(
        session, class_group, from_date, to_date
    )


@router.get("/class-sessions", response_model=list[ClassSessionRead])
async def list_class_sessions(
    from_date: date | None = None,
    to_date: date | None = None,
    class_group_id: int | None = None,
    status_filter: ClassSessionStatus | None = Query(
        default=None, alias="status"
    ),
    room_id: int | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    return await class_sessions.list_class_sessions(
        session,
        from_date=from_date,
        to_date=to_date,
        class_group_id=class_group_id,
        status=status_filter,
        room_id=room_id,
    )


@router.post(
    "/class-sessions/bulk-cancel",
    response_model=list[ClassSessionRead],
)
async def bulk_cancel_class_sessions(
    payload: ClassSessionBulkCancel,
    session: AsyncSession = Depends(get_async_session),
):
    return await class_sessions.bulk_cancel_class_sessions(
        session, payload.class_group_id, payload.dates, payload.reason
    )


@router.patch(
    "/class-sessions/bulk-update",
    response_model=list[ClassSessionRead],
)
async def bulk_update_class_sessions(
    payload: ClassSessionBulkUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    try:
        return await class_sessions.bulk_update_class_sessions(
            session, payload.session_ids, payload.updates
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.get(
    "/class-sessions/{class_session_id}", response_model=ClassSessionRead
)
async def get_class_session(
    class_session_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    return class_session


@router.post(
    "/class-sessions",
    response_model=ClassSessionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_class_session(
    class_session_create: ClassSessionCreate,
    session: AsyncSession = Depends(get_async_session),
):
    return await class_sessions.create_class_session(
        session, class_session_create
    )


@router.patch(
    "/class-sessions/{class_session_id}",
    response_model=ClassSessionRead,
)
async def update_class_session(
    class_session_id: int,
    class_session_update: ClassSessionUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    return await class_sessions.update_class_session(
        session, class_session, class_session_update
    )


@router.delete(
    "/class-sessions/{class_session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_class_session(
    class_session_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    await class_sessions.delete_class_session(session, class_session)


@router.post(
    "/class-sessions/{class_session_id}/cancel",
    response_model=ClassSessionRead,
)
async def cancel_class_session(
    class_session_id: int,
    payload: ClassSessionCancel,
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    return await class_sessions.cancel_class_session(
        session, class_session, payload.reason
    )


@router.post(
    "/class-sessions/{class_session_id}/complete",
    response_model=ClassSessionRead,
)
async def complete_class_session(
    class_session_id: int,
    payload: ClassSessionComplete,
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    return await class_sessions.complete_class_session(
        session, class_session, payload.notes
    )


@router.post(
    "/class-sessions/{class_session_id}/reschedule",
    response_model=ClassSessionRead,
)
async def reschedule_class_session(
    class_session_id: int,
    payload: ClassSessionReschedule,
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    return await class_sessions.reschedule_class_session(
        session,
        class_session,
        payload.new_date,
        payload.new_start_time,
        payload.new_end_time,
        payload.reason,
    )


@router.get(
    "/class-sessions/{class_session_id}/substitutions",
    response_model=list[InstructorSubstitutionRead],
)
async def list_substitutions(
    class_session_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    return await class_sessions.list_substitutions(session, class_session_id)


@router.post(
    "/class-sessions/{class_session_id}/substitutions",
    response_model=InstructorSubstitutionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_substitution(
    class_session_id: int,
    payload: InstructorSubstitutionCreate,
    user: User = Depends(current_superuser),
    session: AsyncSession = Depends(get_async_session),
):
    class_session = await class_sessions.get_class_session(
        session, class_session_id
    )
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found.",
        )
    try:
        return await class_sessions.create_substitution(
            session,
            class_session,
            payload.substitute_instructor_id,
            payload.reason,
            created_by=user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.delete(
    "/substitutions/{substitution_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_substitution(
    substitution_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    substitution = await class_sessions.get_substitution(
        session, substitution_id
    )
    if not substitution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Substitution not found.",
        )
    await class_sessions.delete_substitution(session, substitution)
