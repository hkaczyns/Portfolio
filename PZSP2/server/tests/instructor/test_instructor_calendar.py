import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.user import UserRole
from tests.admin.helpers import (
    create_admin_and_login,
    create_verified_user,
    login,
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
    client: AsyncClient, deps: dict, instructor_id: str, name: str
) -> dict:
    payload = {
        "semesterId": deps["semester_id"],
        "name": name,
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
async def test_instructor_can_view_calendar(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="calendar_instructor@example.com",
        password="Instructor_Password1",
        first_name="Calendar",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    other_instructor = await create_verified_user(
        email="other_instructor@example.com",
        password="Instructor_Password1",
        first_name="Other",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    instructor_group = await create_class_group(
        client, deps, str(instructor.id), "Salsa - Instructor"
    )
    other_group = await create_class_group(
        client, deps, str(other_instructor.id), "Salsa - Other"
    )

    session_dates = ["2024-01-08", "2024-01-15"]
    for session_date in session_dates:
        response = await client.post(
            f"{settings.API_V1_STR}/admin/schedule/class-sessions",
            json={
                "classGroupId": instructor_group["id"],
                "date": session_date,
                "startTime": "18:00",
                "endTime": "19:30",
                "roomId": deps["room_id"],
                "instructorId": str(instructor.id),
            },
        )
        assert response.status_code == status.HTTP_201_CREATED

    other_session = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": other_group["id"],
            "date": "2024-01-10",
            "startTime": "17:00",
            "endTime": "18:00",
            "roomId": deps["room_id"],
            "instructorId": str(other_instructor.id),
        },
    )
    assert other_session.status_code == status.HTTP_201_CREATED

    await login(
        client, "calendar_instructor@example.com", "Instructor_Password1"
    )

    calendar_response = await client.get(
        f"{settings.API_V1_STR}/instructor/calendar",
        params={"from_date": "2024-01-01", "to_date": "2024-01-31"},
    )
    assert calendar_response.status_code == status.HTTP_200_OK
    entries = calendar_response.json()
    assert len(entries) == 2
    assert all(
        entry["classGroupId"] == instructor_group["id"] for entry in entries
    )
