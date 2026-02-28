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
async def test_admin_can_crud_class_sessions(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="sessions@example.com",
        password="Instructor_Password1",
        first_name="Session",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))

    payload = {
        "classGroupId": class_group["id"],
        "date": "2024-01-15",
        "startTime": "18:00",
        "endTime": "19:30",
        "roomId": deps["room_id"],
        "instructorId": str(instructor.id),
        "notes": "Start",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions", json=payload
    )
    assert response.status_code == status.HTTP_201_CREATED
    class_session = response.json()
    assert class_session["classGroupId"] == class_group["id"]

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        params={"class_group_id": class_group["id"]},
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert any(
        item["id"] == class_session["id"] for item in list_response.json()
    )

    detail_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{class_session['id']}"
    )
    assert detail_response.status_code == status.HTTP_200_OK
    assert detail_response.json()["id"] == class_session["id"]

    update_response = await client.patch(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{class_session['id']}",
        json={"notes": "Update"},
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["notes"] == "Update"

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{class_session['id']}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    list_after_delete = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        params={"class_group_id": class_group["id"]},
    )
    assert list_after_delete.status_code == status.HTTP_200_OK
    assert list_after_delete.json() == []


@pytest.mark.asyncio
async def test_admin_can_manage_class_session_statuses(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="status@example.com",
        password="Instructor_Password1",
        first_name="Status",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))

    session_payload = {
        "classGroupId": class_group["id"],
        "date": "2024-02-05",
        "startTime": "18:00",
        "endTime": "19:30",
        "roomId": deps["room_id"],
        "instructorId": str(instructor.id),
    }
    cancel_session = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json=session_payload,
    )
    assert cancel_session.status_code == status.HTTP_201_CREATED
    cancel_id = cancel_session.json()["id"]

    cancel_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{cancel_id}/cancel",
        json={"reason": "Swieto"},
    )
    assert cancel_response.status_code == status.HTTP_200_OK
    assert cancel_response.json()["status"] == "cancelled"

    complete_session = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            **session_payload,
            "date": "2024-02-12",
        },
    )
    assert complete_session.status_code == status.HTTP_201_CREATED
    complete_id = complete_session.json()["id"]
    complete_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{complete_id}/complete",
        json={"notes": "Lekcja zakonczona"},
    )
    assert complete_response.status_code == status.HTTP_200_OK
    assert complete_response.json()["status"] == "completed"

    reschedule_session = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            **session_payload,
            "date": "2024-02-19",
        },
    )
    assert reschedule_session.status_code == status.HTTP_201_CREATED
    reschedule_id = reschedule_session.json()["id"]
    reschedule_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{reschedule_id}/reschedule",
        json={
            "newDate": "2024-02-20",
            "newStartTime": "19:00",
            "newEndTime": "20:30",
            "reason": "Kolizja",
        },
    )
    assert reschedule_response.status_code == status.HTTP_200_OK
    assert reschedule_response.json()["rescheduledFromId"] == reschedule_id

    old_session_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{reschedule_id}"
    )
    assert old_session_response.status_code == status.HTTP_200_OK
    assert old_session_response.json()["status"] == "cancelled"


@pytest.mark.asyncio
async def test_admin_can_bulk_cancel_and_update_class_sessions(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="bulk@example.com",
        password="Instructor_Password1",
        first_name="Bulk",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    substitute = await create_verified_user(
        email="bulk2@example.com",
        password="Instructor_Password1",
        first_name="Bulk",
        last_name="Two",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))

    session_ids = []
    dates = ["2024-03-04", "2024-03-11", "2024-03-18"]
    for session_date in dates:
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
        session_ids.append(response.json()["id"])

    cancel_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/bulk-cancel",
        json={
            "classGroupId": class_group["id"],
            "dates": dates[:2],
            "reason": "Swieta",
        },
    )
    assert cancel_response.status_code == status.HTTP_200_OK
    assert all(
        item["status"] == "cancelled" for item in cancel_response.json()
    )

    new_room_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/rooms",
        json={"name": "Sala B", "capacity": 15},
    )
    assert new_room_response.status_code == status.HTTP_201_CREATED
    new_room_id = new_room_response.json()["id"]
    update_response = await client.patch(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/bulk-update",
        json={
            "sessionIds": session_ids,
            "updates": {
                "roomId": new_room_id,
                "instructorId": str(substitute.id),
            },
        },
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert all(
        item["roomId"] == new_room_id for item in update_response.json()
    )
    assert all(
        item["instructorId"] == str(substitute.id)
        for item in update_response.json()
    )


@pytest.mark.asyncio
async def test_admin_can_manage_substitutions(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="sub@example.com",
        password="Instructor_Password1",
        first_name="Sub",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    substitute = await create_verified_user(
        email="sub2@example.com",
        password="Instructor_Password1",
        first_name="Sub",
        last_name="Two",
        role=UserRole.INSTRUCTOR,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))
    session_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": class_group["id"],
            "date": "2024-04-01",
            "startTime": "18:00",
            "endTime": "19:30",
            "roomId": deps["room_id"],
            "instructorId": str(instructor.id),
        },
    )
    assert session_response.status_code == status.HTTP_201_CREATED
    class_session_id = session_response.json()["id"]

    create_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{class_session_id}/substitutions",
        json={
            "substituteInstructorId": str(substitute.id),
            "reason": "Urlop",
        },
    )
    assert create_response.status_code == status.HTTP_201_CREATED
    substitution_id = create_response.json()["id"]

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{class_session_id}/substitutions"
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) == 1

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/admin/schedule/substitutions/{substitution_id}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    list_after_delete = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions/{class_session_id}/substitutions"
    )
    assert list_after_delete.status_code == status.HTTP_200_OK
    assert list_after_delete.json() == []


@pytest.mark.asyncio
@pytest.mark.parametrize("role", [UserRole.STUDENT, UserRole.INSTRUCTOR])
async def test_non_admin_cannot_manage_class_sessions(
    client: AsyncClient, role: UserRole
) -> None:
    if role == UserRole.STUDENT:
        await create_student_and_login(client)
    else:
        await create_instructor_and_login(client)

    response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": 1,
            "date": "2024-01-01",
            "startTime": "18:00",
            "endTime": "19:30",
        },
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
