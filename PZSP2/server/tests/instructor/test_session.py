import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.attendance import AttendanceStatus
from app.models.enrollment import EnrollmentStatus
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
async def test_instructor_can_manage_attendance(
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

    enrollment_one = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_one.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert enrollment_one.status_code == status.HTTP_201_CREATED
    enrollment_two = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_two.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert enrollment_two.status_code == status.HTTP_201_CREATED

    await login(client, "instructor@example.com", "Instructor_Password1")

    list_response = await client.get(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/attendance"
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) == 2

    bulk_response = await client.post(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/attendance",
        json={
            "items": [
                {
                    "studentId": str(student_one.id),
                    "status": AttendanceStatus.PRESENT.value,
                    "isMakeup": False,
                },
                {
                    "studentId": str(student_two.id),
                    "status": AttendanceStatus.ABSENT.value,
                    "isMakeup": False,
                },
            ]
        },
    )
    assert bulk_response.status_code == status.HTTP_200_OK

    patch_response = await client.patch(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/attendance/{student_two.id}",
        json={"status": AttendanceStatus.EXCUSED.value, "isMakeup": True},
    )
    assert patch_response.status_code == status.HTTP_200_OK
    assert patch_response.json()["status"] == AttendanceStatus.EXCUSED.value
    assert patch_response.json()["isMakeup"] is True

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/attendance/{student_one.id}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    makeup_response = await client.post(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/makeup/{student_two.id}"
    )
    assert makeup_response.status_code == status.HTTP_200_OK
    assert makeup_response.json()["isMakeup"] is True

    unmakeup_response = await client.delete(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/makeup/{student_two.id}"
    )
    assert unmakeup_response.status_code == status.HTTP_200_OK
    assert unmakeup_response.json()["isMakeup"] is False


@pytest.mark.asyncio
async def test_instructor_can_mark_makeup_for_other_group_student(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="makeup_instructor@example.com",
        password="Instructor_Password1",
        first_name="Makeup",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    student = await create_verified_user(
        email="makeup_student@example.com",
        password="Student_Password1",
        first_name="Makeup",
        last_name="Student",
        role=UserRole.STUDENT,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))
    other_group = await create_class_group(client, deps, str(instructor.id))

    session_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": class_group["id"],
            "date": "2024-02-10",
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
            "classGroupId": other_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert enrollment_response.status_code == status.HTTP_201_CREATED

    await login(
        client, "makeup_instructor@example.com", "Instructor_Password1"
    )

    makeup_response = await client.post(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/makeup/{student.id}"
    )
    assert makeup_response.status_code == status.HTTP_200_OK
    assert makeup_response.json()["isMakeup"] is True


@pytest.mark.asyncio
async def test_bulk_attendance_allows_makeup_from_other_group(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="bulk_makeup_instructor@example.com",
        password="Instructor_Password1",
        first_name="Bulk",
        last_name="Makeup",
        role=UserRole.INSTRUCTOR,
    )
    student_regular = await create_verified_user(
        email="bulk_makeup_regular@example.com",
        password="Student_Password1",
        first_name="Bulk",
        last_name="Regular",
        role=UserRole.STUDENT,
    )
    student_makeup = await create_verified_user(
        email="bulk_makeup_other@example.com",
        password="Student_Password1",
        first_name="Bulk",
        last_name="Other",
        role=UserRole.STUDENT,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))
    other_group = await create_class_group(client, deps, str(instructor.id))

    session_response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/class-sessions",
        json={
            "classGroupId": class_group["id"],
            "date": "2024-02-20",
            "startTime": "18:00",
            "endTime": "19:30",
            "roomId": deps["room_id"],
            "instructorId": str(instructor.id),
        },
    )
    assert session_response.status_code == status.HTTP_201_CREATED
    class_session_id = session_response.json()["id"]

    regular_enrollment = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_regular.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert regular_enrollment.status_code == status.HTTP_201_CREATED
    makeup_enrollment = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student_makeup.id),
            "classGroupId": other_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert makeup_enrollment.status_code == status.HTTP_201_CREATED

    await login(
        client, "bulk_makeup_instructor@example.com", "Instructor_Password1"
    )

    bulk_response = await client.post(
        f"{settings.API_V1_STR}/instructor/sessions/{class_session_id}/attendance",
        json={
            "items": [
                {
                    "studentId": str(student_regular.id),
                    "status": AttendanceStatus.PRESENT.value,
                    "isMakeup": False,
                },
                {
                    "studentId": str(student_makeup.id),
                    "status": AttendanceStatus.PRESENT.value,
                    "isMakeup": True,
                },
            ]
        },
    )
    assert bulk_response.status_code == status.HTTP_200_OK
    payload = {item["studentId"]: item for item in bulk_response.json()}
    assert payload[str(student_regular.id)]["isMakeup"] is False
    assert payload[str(student_makeup.id)]["isMakeup"] is True
