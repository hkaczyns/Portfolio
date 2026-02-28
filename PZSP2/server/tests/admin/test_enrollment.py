import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.enrollment import EnrollmentStatus
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
    client: AsyncClient, deps: dict, instructor_id: str, capacity: int = 2
) -> dict:
    payload = {
        "semesterId": deps["semester_id"],
        "name": "Salsa - Start",
        "levelId": deps["skill_level_id"],
        "topicId": deps["topic_id"],
        "dayOfWeek": 1,
        "startTime": "18:00",
        "endTime": "19:30",
        "capacity": capacity,
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
async def test_admin_can_manage_enrollments(
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

    create_response = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert create_response.status_code == status.HTTP_201_CREATED
    enrollment = create_response.json()

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/enrollments",
        params={"class_group_id": class_group["id"]},
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) == 1

    update_response = await client.patch(
        f"{settings.API_V1_STR}/admin/enrollments/{enrollment['id']}",
        json={"status": EnrollmentStatus.CANCELLED.value},
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["status"] == EnrollmentStatus.CANCELLED.value

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/admin/enrollments/{enrollment['id']}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    list_after = await client.get(
        f"{settings.API_V1_STR}/admin/enrollments",
        params={"class_group_id": class_group["id"]},
    )
    assert list_after.status_code == status.HTTP_200_OK
    assert list_after.json() == []


@pytest.mark.asyncio
async def test_admin_can_promote_waitlist(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="inst2@example.com",
        password="Instructor_Password1",
        first_name="Inst",
        last_name="Two",
        role=UserRole.INSTRUCTOR,
    )
    student_one = await create_verified_user(
        email="student1@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="One",
        role=UserRole.STUDENT,
    )
    student_two = await create_verified_user(
        email="student2@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="Two",
        role=UserRole.STUDENT,
    )
    class_group = await create_class_group(
        client, deps, str(instructor.id), capacity=1
    )

    active_response = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_one.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert active_response.status_code == status.HTTP_201_CREATED
    waitlist_response = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_two.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.WAITLISTED.value,
        },
    )
    assert waitlist_response.status_code == status.HTTP_201_CREATED
    active_id = active_response.json()["id"]

    cancel_response = await client.patch(
        f"{settings.API_V1_STR}/admin/enrollments/{active_id}",
        json={"status": EnrollmentStatus.CANCELLED.value},
    )
    assert cancel_response.status_code == status.HTTP_200_OK

    promote_response = await client.post(
        f"{settings.API_V1_STR}/admin/class-groups/{class_group['id']}/waitlist/promote"
    )
    assert promote_response.status_code == status.HTTP_200_OK
    assert promote_response.json()["status"] == EnrollmentStatus.ACTIVE.value
