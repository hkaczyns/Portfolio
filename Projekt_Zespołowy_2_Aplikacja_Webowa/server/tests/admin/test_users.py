import pytest
from fastapi import status
from httpx import AsyncClient

from app.auth.crud import create_user
from app.core.config import get_settings
from app.models.enrollment import EnrollmentStatus
from app.models.user import UserRole
from app.schemas.user import UserCreate
from tests.admin.helpers import (
    create_admin_and_login,
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
async def test_admin_can_list_users_with_filters_and_sorting(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)

    await create_verified_user(
        email="instructor@example.com",
        password="Instructor_Password1",
        first_name="Inst",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    active_student = await create_verified_user(
        email="student.active@example.com",
        password="Student_Password1",
        first_name="Jan",
        last_name="Kowalski",
        role=UserRole.STUDENT,
    )
    inactive_student = await create_user(
        UserCreate(
            email="student.inactive@example.com",
            password="Student_Password1",
            first_name="Inactive",
            last_name="Student",
            role=UserRole.STUDENT,
            is_active=False,
            is_verified=True,
        )
    )

    response = await client.get(
        f"{settings.API_V1_STR}/admin/users",
        params={"role": UserRole.STUDENT.value, "is_active": "false"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == str(inactive_student.id)

    search_response = await client.get(
        f"{settings.API_V1_STR}/admin/users",
        params={"role": UserRole.STUDENT.value, "search": "KOWAL"},
    )
    assert search_response.status_code == status.HTTP_200_OK
    assert any(
        item["id"] == str(active_student.id) for item in search_response.json()
    )

    await create_verified_user(
        email="sorta@example.com",
        password="Student_Password1",
        first_name="Sort",
        last_name="SortA",
        role=UserRole.STUDENT,
    )
    await create_verified_user(
        email="sortb@example.com",
        password="Student_Password1",
        first_name="Sort",
        last_name="SortB",
        role=UserRole.STUDENT,
    )
    await create_verified_user(
        email="sortc@example.com",
        password="Student_Password1",
        first_name="Sort",
        last_name="SortC",
        role=UserRole.STUDENT,
    )

    sort_response = await client.get(
        f"{settings.API_V1_STR}/admin/users",
        params={
            "role": UserRole.STUDENT.value,
            "search": "sort",
            "page": 1,
            "page_size": 2,
            "sort_by": "last_name",
            "sort_order": "asc",
        },
    )
    assert sort_response.status_code == status.HTTP_200_OK
    sorted_users = sort_response.json()
    assert [item["lastName"] for item in sorted_users] == [
        "SortA",
        "SortB",
    ]


@pytest.mark.asyncio
async def test_admin_can_get_user_details_with_role_data(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    deps = await create_schedule_dependencies(client)
    instructor = await create_verified_user(
        email="inst.details@example.com",
        password="Instructor_Password1",
        first_name="Inst",
        last_name="Details",
        role=UserRole.INSTRUCTOR,
    )
    student = await create_verified_user(
        email="student.details@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="Details",
        role=UserRole.STUDENT,
    )
    class_group = await create_class_group(client, deps, str(instructor.id))

    enrollment_response = await client.post(
        f"{settings.API_V1_STR}/admin/enrollments",
        json={
            "studentId": str(student.id),
            "classGroupId": class_group["id"],
            "status": EnrollmentStatus.ACTIVE.value,
        },
    )
    assert enrollment_response.status_code == status.HTTP_201_CREATED

    instructor_response = await client.get(
        f"{settings.API_V1_STR}/admin/users/{instructor.id}"
    )
    assert instructor_response.status_code == status.HTTP_200_OK
    instructor_data = instructor_response.json()
    assert any(
        item["id"] == class_group["id"]
        for item in instructor_data["classGroups"]
    )
    assert instructor_data["activityStats"]["classGroupsTotal"] == 1

    student_response = await client.get(
        f"{settings.API_V1_STR}/admin/users/{student.id}"
    )
    assert student_response.status_code == status.HTTP_200_OK
    student_data = student_response.json()
    assert any(
        item["classGroupId"] == class_group["id"]
        for item in student_data["enrollments"]
    )
    assert student_data["activityStats"]["enrollmentsTotal"] == 1
    assert student_data["activityStats"]["enrollmentsActive"] == 1
    assert (
        student_data["activityStats"]["attendanceSummary"]["totalCount"] == 0
    )


@pytest.mark.asyncio
async def test_admin_can_list_users_by_role(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    instructor = await create_verified_user(
        email="inst.role@example.com",
        password="Instructor_Password1",
        first_name="Role",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    student = await create_verified_user(
        email="student.role@example.com",
        password="Student_Password1",
        first_name="Role",
        last_name="Student",
        role=UserRole.STUDENT,
    )

    instructors_response = await client.get(
        f"{settings.API_V1_STR}/admin/users/instructors"
    )
    assert instructors_response.status_code == status.HTTP_200_OK
    instructors = instructors_response.json()
    assert any(item["id"] == str(instructor.id) for item in instructors)
    assert all(
        item["role"] == UserRole.INSTRUCTOR.value for item in instructors
    )

    students_response = await client.get(
        f"{settings.API_V1_STR}/admin/users/students"
    )
    assert students_response.status_code == status.HTTP_200_OK
    students = students_response.json()
    assert any(item["id"] == str(student.id) for item in students)
    assert all(item["role"] == UserRole.STUDENT.value for item in students)


@pytest.mark.asyncio
async def test_non_admin_cannot_access_user_admin_endpoints(
    client: AsyncClient,
) -> None:
    await create_student_and_login(client)

    response = await client.get(f"{settings.API_V1_STR}/admin/users")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = await client.get(f"{settings.API_V1_STR}/admin/users/students")
    assert response.status_code == status.HTTP_403_FORBIDDEN
