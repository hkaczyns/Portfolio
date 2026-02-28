import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.attendance import AttendanceStatus
from app.models.user import UserRole
from tests.admin.helpers import create_admin_and_login, create_verified_user

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
        "name": "Salsa - Start",
        "levelId": deps["skill_level_id"],
        "topicId": deps["topic_id"],
        "dayOfWeek": 1,
        "startTime": "18:00",
        "endTime": "19:30",
        "capacity": 2,
        "instructorId": instructor_id,
        "roomId": deps["room_id"],
        "isPublic": True,
        "status": "OPEN",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-groups", json=payload
    )
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


@pytest.mark.asyncio
async def test_admin_can_manage_attendance(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="instructor@example.com",
        password="Instructor_Password1",
        first_name="Inst",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    student = await create_verified_user(
        email="student@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))

    session_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": class_group["id"],
            "date": "2024-01-15",
            "startTime": "18:00",
            "endTime": "19:30",
            "roomId": deps["room_id"],
            "instructorId": str(instructor.id),
        },
    )
    assert session_response.status_code == status.HTTP_201_CREATED
    class_session_id = session_response.json()["id"]

    create_response = await client.post(
        f"{settings.API_V1_STR}/admin/attendance",
        json={
            "classSessionId": class_session_id,
            "studentId": str(student.id),
            "status": AttendanceStatus.PRESENT.value,
            "isMakeup": False,
        },
    )
    assert create_response.status_code == status.HTTP_201_CREATED
    attendance = create_response.json()

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/attendance",
        params={"session_id": class_session_id},
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) == 1

    get_response = await client.get(
        f"{settings.API_V1_STR}/admin/attendance/{attendance['id']}"
    )
    assert get_response.status_code == status.HTTP_200_OK

    patch_response = await client.patch(
        f"{settings.API_V1_STR}/admin/attendance/{attendance['id']}",
        json={"status": AttendanceStatus.EXCUSED.value},
    )
    assert patch_response.status_code == status.HTTP_200_OK
    assert patch_response.json()["status"] == AttendanceStatus.EXCUSED.value

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/admin/attendance/{attendance['id']}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
