import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.attendance import AttendanceStatus
from app.models.enrollment import EnrollmentStatus
from app.models.user import UserRole
from tests.admin.helpers import (
    create_admin_and_login,
    create_student_and_login,
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
    client: AsyncClient, deps: dict, instructor_id: str, capacity: int = 1
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
async def test_student_can_enroll_and_waitlist(
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
    class_group = await create_class_group(
        client, deps, str(instructor.id), capacity=1
    )

    primary_student = await create_verified_user(
        email="student1@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="One",
        role=UserRole.STUDENT,
    )
    fill_response = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(primary_student.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert fill_response.status_code == status.HTTP_201_CREATED

    await create_verified_user(
        email="student2@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="Two",
        role=UserRole.STUDENT,
    )
    await login(client, "student2@example.com", "Student_Password1")

    response = await client.post(
        f"{settings.API_V1_STR}/me/enrollments",
        json={"classGroupId": class_group["id"], "mode": "AUTO"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    enrollment = response.json()["enrollment"]
    assert enrollment["status"] == EnrollmentStatus.WAITLISTED.value

    leave_response = await client.post(
        f"{settings.API_V1_STR}/me/enrollments/{enrollment['id']}/leave-waitlist"
    )
    assert leave_response.status_code == status.HTTP_200_OK
    assert leave_response.json()["status"] == EnrollmentStatus.CANCELLED.value


@pytest.mark.asyncio
async def test_student_can_cancel_enrollment(
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
    class_group = await create_class_group(
        client, deps, str(instructor.id), capacity=2
    )

    await create_student_and_login(client)
    response = await client.post(
        f"{settings.API_V1_STR}/me/enrollments",
        json={"classGroupId": class_group["id"], "mode": "AUTO"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    enrollment = response.json()["enrollment"]

    cancel_response = await client.post(
        f"{settings.API_V1_STR}/me/enrollments/{enrollment['id']}/cancel"
    )
    assert cancel_response.status_code == status.HTTP_200_OK
    assert cancel_response.json()["status"] == EnrollmentStatus.CANCELLED.value


@pytest.mark.asyncio
async def test_student_can_view_attendance_and_summary(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="inst3@example.com",
        password="Instructor_Password1",
        first_name="Inst",
        last_name="Three",
        role=UserRole.INSTRUCTOR,
    )
    student = await create_verified_user(
        email="student3@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="Three",
        role=UserRole.STUDENT,
    )
    class_group = await create_class_group(
        client, deps, str(instructor.id), capacity=2
    )
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

    enrollment_response = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert enrollment_response.status_code == status.HTTP_201_CREATED

    attendance_response = await client.post(
        f"{settings.API_V1_STR}/admin/attendance",
        json={
            "classSessionId": class_session_id,
            "studentId": str(student.id),
            "status": AttendanceStatus.PRESENT.value,
            "isMakeup": False,
        },
    )
    assert attendance_response.status_code == status.HTTP_201_CREATED

    await login(client, "student3@example.com", "Student_Password1")
    list_response = await client.get(
        f"{settings.API_V1_STR}/me/attendance",
        params={"class_group_id": class_group["id"]},
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) == 1

    summary_response = await client.get(
        f"{settings.API_V1_STR}/me/attendance/summary",
        params={"class_group_id": class_group["id"]},
    )
    assert summary_response.status_code == status.HTTP_200_OK
    summary = summary_response.json()
    assert summary["presentCount"] == 1
