import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.user import UserRole
from tests.admin.helpers import (
    create_admin_and_login,
    create_instructor_and_login,
    create_student_and_login,
    create_verified_user,
)

settings = get_settings()


async def create_schedule_dependencies(client: AsyncClient) -> dict:
    skill_level_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/skill-levels",
        json={"name": "Poczatkujacy", "description": "Start"},
    )
    assert skill_level_response.status_code == status.HTTP_201_CREATED
    topic_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/topics",
        json={"name": "Salsa", "description": "Taniec"},
    )
    assert topic_response.status_code == status.HTTP_201_CREATED
    room_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/rooms",
        json={"name": "Sala A", "capacity": 20},
    )
    assert room_response.status_code == status.HTTP_201_CREATED
    semester_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/semesters",
        json={
            "name": "2024/2025 Zima",
            "startDate": "2024-01-01",
            "endDate": "2024-06-30",
            "isActive": True,
        },
    )
    assert semester_response.status_code == status.HTTP_201_CREATED
    return {
        "skill_level_id": skill_level_response.json()["id"],
        "topic_id": topic_response.json()["id"],
        "room_id": room_response.json()["id"],
        "semester_id": semester_response.json()["id"],
    }


async def create_class_group(
    client: AsyncClient, deps: dict, instructor_id: str
) -> dict:
    payload = {
        "semesterId": deps["semester_id"],
        "name": "Salsa - Poczatkujacy",
        "levelId": deps["skill_level_id"],
        "topicId": deps["topic_id"],
        "dayOfWeek": 1,
        "startTime": "18:00",
        "endTime": "19:30",
        "capacity": 20,
        "instructorId": instructor_id,
        "roomId": deps["room_id"],
        "isPublic": True,
    }
    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups", json=payload
    )
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


@pytest.mark.asyncio
async def test_admin_can_view_calendar(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="calendar@example.com",
        password="Instructor_Password1",
        first_name="Calendar",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))

    session_dates = ["2024-01-08", "2024-01-15"]
    for session_date in session_dates:
        response = await client.post(
            f"{settings.API_V1_STR}/admin/schedule/class-sessions",
            json={
                "classGroupId": class_group["id"],
                "date": session_date,
                "startTime": "18:00",
                "endTime": "19:30",
                "roomId": deps["room_id"],
                "instructorId": str(instructor.id),
            },
        )
        assert response.status_code == status.HTTP_201_CREATED

    calendar_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/calendar",
        params={
            "from_date": "2024-01-01",
            "to_date": "2024-01-31",
        },
    )
    assert calendar_response.status_code == status.HTTP_200_OK
    entries = calendar_response.json()
    assert len(entries) == 2
    assert entries[0]["classGroupName"] == class_group["name"]

    filtered_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/calendar",
        params={
            "from_date": "2024-01-01",
            "to_date": "2024-01-31",
            "room_id": deps["room_id"],
            "instructor_id": str(instructor.id),
        },
    )
    assert filtered_response.status_code == status.HTTP_200_OK
    assert len(filtered_response.json()) == 2


@pytest.mark.asyncio
@pytest.mark.parametrize("role", [UserRole.STUDENT, UserRole.INSTRUCTOR])
async def test_non_admin_cannot_view_calendar(
    client: AsyncClient, role: UserRole
) -> None:
    if role == UserRole.STUDENT:
        await create_student_and_login(client)
    else:
        await create_instructor_and_login(client)

    response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/calendar"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
