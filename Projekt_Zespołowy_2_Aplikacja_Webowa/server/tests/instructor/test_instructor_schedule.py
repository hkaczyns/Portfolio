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
async def test_instructor_can_complete_and_manage_substitutions(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="schedule_owner@example.com",
        password="Instructor_Password1",
        first_name="Schedule",
        last_name="Owner",
        role=UserRole.INSTRUCTOR,
    )
    substitute = await create_verified_user(
        email="schedule_substitute@example.com",
        password="Instructor_Password1",
        first_name="Schedule",
        last_name="Substitute",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(
        client, deps, str(instructor.id), "Salsa - Owner"
    )
    session_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": class_group["id"],
            "date": "2024-04-08",
            "startTime": "18:00",
            "endTime": "19:30",
            "roomId": deps["room_id"],
            "instructorId": str(instructor.id),
        },
    )
    assert session_response.status_code == status.HTTP_201_CREATED
    class_session_id = session_response.json()["id"]

    await login(client, "schedule_owner@example.com", "Instructor_Password1")

    substitution_response = await client.post(
        f"{settings.API_V1_STR}/instructor/schedule/class-sessions/{class_session_id}/substitutions",
        json={
            "substituteInstructorId": str(substitute.id),
            "reason": "Urlop",
        },
    )
    assert substitution_response.status_code == status.HTTP_201_CREATED
    substitution_data = substitution_response.json()
    assert substitution_data["originalInstructorId"] == str(instructor.id)
    assert substitution_data["substituteInstructorId"] == str(substitute.id)
    substitution_id = substitution_data["id"]

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/instructor/schedule/substitutions/{substitution_id}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    complete_response = await client.post(
        f"{settings.API_V1_STR}/instructor/schedule/class-sessions/{class_session_id}/complete",
        json={"notes": "Zakonczone"},
    )
    assert complete_response.status_code == status.HTTP_200_OK
    assert complete_response.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_instructor_cannot_manage_other_sessions(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="schedule_instructor@example.com",
        password="Instructor_Password1",
        first_name="Schedule",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    other_instructor = await create_verified_user(
        email="schedule_other@example.com",
        password="Instructor_Password1",
        first_name="Other",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(
        client, deps, str(other_instructor.id), "Salsa - Other"
    )
    session_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": class_group["id"],
            "date": "2024-04-10",
            "startTime": "18:00",
            "endTime": "19:30",
            "roomId": deps["room_id"],
            "instructorId": str(other_instructor.id),
        },
    )
    assert session_response.status_code == status.HTTP_201_CREATED
    class_session_id = session_response.json()["id"]

    substitution_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{class_session_id}/substitutions",
        json={
            "substituteInstructorId": str(instructor.id),
            "reason": "Zastepstwo",
        },
    )
    assert substitution_response.status_code == status.HTTP_201_CREATED
    substitution_id = substitution_response.json()["id"]

    await login(
        client, "schedule_instructor@example.com", "Instructor_Password1"
    )

    complete_response = await client.post(
        f"{settings.API_V1_STR}/instructor/schedule/class-sessions/{class_session_id}/complete",
        json={"notes": "Nie moje"},
    )
    assert complete_response.status_code == status.HTTP_403_FORBIDDEN

    create_response = await client.post(
        f"{settings.API_V1_STR}/instructor/schedule/class-sessions/{class_session_id}/substitutions",
        json={
            "substituteInstructorId": str(instructor.id),
            "reason": "Nie moje",
        },
    )
    assert create_response.status_code == status.HTTP_403_FORBIDDEN

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/instructor/schedule/substitutions/{substitution_id}"
    )
    assert delete_response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_substitution_requires_assigned_instructor(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="schedule_missing_instructor@example.com",
        password="Instructor_Password1",
        first_name="Schedule",
        last_name="Missing",
        role=UserRole.INSTRUCTOR,
    )
    substitute = await create_verified_user(
        email="schedule_missing_substitute@example.com",
        password="Instructor_Password1",
        first_name="Schedule",
        last_name="Substitute",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(
        client, deps, str(instructor.id), "Salsa - Missing"
    )
    session_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": class_group["id"],
            "date": "2024-04-15",
            "startTime": "18:00",
            "endTime": "19:30",
            "roomId": deps["room_id"],
            "instructorId": None,
        },
    )
    assert session_response.status_code == status.HTTP_201_CREATED
    class_session_id = session_response.json()["id"]

    substitution_response = await client.post(
        f"{settings.API_V1_STR}/instructor/schedule/class-sessions/{class_session_id}/substitutions",
        json={
            "substituteInstructorId": str(substitute.id),
            "reason": "Brak instruktora",
        },
    )
    assert substitution_response.status_code == status.HTTP_400_BAD_REQUEST
    assert (
        substitution_response.json()["detail"]
        == "Class session has no instructor assigned."
    )
