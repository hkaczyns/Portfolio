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


def build_class_group_payload(
    deps: dict, instructor_id: str, overrides: dict | None = None
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
    if overrides:
        payload.update(overrides)
    return payload


@pytest.mark.asyncio
async def test_admin_can_manage_class_groups(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="instructor@example.com",
        password="Instructor_Password1",
        first_name="Instructor",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    payload = build_class_group_payload(deps, str(instructor.id))

    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups", json=payload
    )
    assert response.status_code == status.HTTP_201_CREATED
    class_group = response.json()
    assert class_group["name"] == payload["name"]

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-groups"
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert any(
        item["id"] == class_group["id"] for item in list_response.json()
    )

    detail_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-groups/{class_group['id']}"
    )
    assert detail_response.status_code == status.HTTP_200_OK
    assert detail_response.json()["id"] == class_group["id"]

    update_response = await client.patch(
        f"{settings.API_V1_STR}/admin/schedule/class-groups/{class_group['id']}",
        json={"capacity": 25},
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["capacity"] == 25

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/admin/schedule/class-groups/{class_group['id']}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    list_after_delete = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-groups"
    )
    assert list_after_delete.status_code == status.HTTP_200_OK
    assert list_after_delete.json() == []


@pytest.mark.asyncio
async def test_admin_can_generate_and_delete_class_group_sessions(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="generator@example.com",
        password="Instructor_Password1",
        first_name="Generator",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    payload = build_class_group_payload(deps, str(instructor.id))
    class_group_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups", json=payload
    )
    class_group = class_group_response.json()

    generate_payload = {
        "startDate": "2024-01-01",
        "endDate": "2024-01-31",
        "skipDates": ["2024-01-15"],
    }
    generate_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups/{class_group['id']}/generate-sessions",
        json=generate_payload,
    )
    assert generate_response.status_code == status.HTTP_201_CREATED
    sessions = generate_response.json()
    assert len(sessions) == 4

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/admin/schedule/class-groups/{class_group['id']}/sessions",
        params={"from_date": "2024-01-01", "to_date": "2024-01-31"},
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        params={
            "class_group_id": class_group["id"],
            "from_date": "2024-01-01",
            "to_date": "2024-01-31",
        },
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert list_response.json() == []


@pytest.mark.asyncio
async def test_generate_sessions_detects_conflicts(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="conflict@example.com",
        password="Instructor_Password1",
        first_name="Conflict",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    payload = build_class_group_payload(deps, str(instructor.id))
    class_group_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups", json=payload
    )
    class_group = class_group_response.json()

    existing_session_payload = {
        "classGroupId": class_group["id"],
        "date": "2024-01-08",
        "startTime": "18:00",
        "endTime": "19:30",
        "roomId": deps["room_id"],
        "instructorId": str(instructor.id),
    }
    existing_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json=existing_session_payload,
    )
    assert existing_response.status_code == status.HTTP_201_CREATED

    generate_payload = {
        "startDate": "2024-01-01",
        "endDate": "2024-01-31",
    }
    generate_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups/{class_group['id']}/generate-sessions",
        json=generate_payload,
    )
    assert generate_response.status_code == status.HTTP_409_CONFLICT


@pytest.mark.asyncio
@pytest.mark.parametrize("role", [UserRole.STUDENT, UserRole.INSTRUCTOR])
async def test_non_admin_cannot_manage_class_groups(
    client: AsyncClient, role: UserRole
) -> None:
    if role == UserRole.STUDENT:
        await create_student_and_login(client)
    else:
        await create_instructor_and_login(client)

    payload = {
        "semesterId": 1,
        "name": "Salsa - Start",
        "levelId": 1,
        "topicId": 1,
        "dayOfWeek": 1,
        "startTime": "18:00",
        "endTime": "19:30",
        "capacity": 20,
        "roomId": 1,
    }

    response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-groups"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups", json=payload
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = await client.delete(
        f"{settings.API_V1_STR}/admin/schedule/class-groups/1"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
