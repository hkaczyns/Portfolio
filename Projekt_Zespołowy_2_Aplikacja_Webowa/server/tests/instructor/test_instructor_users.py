import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.user import UserRole
from tests.admin.helpers import (
    create_student_and_login,
    create_verified_user,
    login,
)

settings = get_settings()


@pytest.mark.asyncio
async def test_instructor_can_list_all_users(
    client: AsyncClient,
) -> None:
    instructor = await create_verified_user(
        email="list.instructor@example.com",
        password="Instructor_Password1",
        first_name="List",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    other_instructor = await create_verified_user(
        email="list.other@example.com",
        password="Instructor_Password1",
        first_name="Other",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    student = await create_verified_user(
        email="list.student@example.com",
        password="Student_Password1",
        first_name="List",
        last_name="Student",
        role=UserRole.STUDENT,
    )

    await login(client, "list.instructor@example.com", "Instructor_Password1")

    response = await client.get(f"{settings.API_V1_STR}/instructor/users")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert any(item["id"] == str(other_instructor.id) for item in data)
    assert any(item["id"] == str(student.id) for item in data)
    assert any(item["id"] == str(instructor.id) for item in data)


@pytest.mark.asyncio
async def test_instructor_can_list_users_by_role(
    client: AsyncClient,
) -> None:
    await create_verified_user(
        email="role.owner@example.com",
        password="Instructor_Password1",
        first_name="Role",
        last_name="Owner",
        role=UserRole.INSTRUCTOR,
    )
    other_instructor = await create_verified_user(
        email="role.inst@example.com",
        password="Instructor_Password1",
        first_name="Role",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
    )
    student = await create_verified_user(
        email="role.student@example.com",
        password="Student_Password1",
        first_name="Role",
        last_name="Student",
        role=UserRole.STUDENT,
    )

    await login(client, "role.owner@example.com", "Instructor_Password1")

    instructors_response = await client.get(
        f"{settings.API_V1_STR}/instructor/users/instructors"
    )
    assert instructors_response.status_code == status.HTTP_200_OK
    instructors = instructors_response.json()
    assert any(item["id"] == str(other_instructor.id) for item in instructors)
    assert all(
        item["role"] == UserRole.INSTRUCTOR.value for item in instructors
    )

    students_response = await client.get(
        f"{settings.API_V1_STR}/instructor/users/students"
    )
    assert students_response.status_code == status.HTTP_200_OK
    students = students_response.json()
    assert any(item["id"] == str(student.id) for item in students)
    assert all(item["role"] == UserRole.STUDENT.value for item in students)


@pytest.mark.asyncio
async def test_student_cannot_access_instructor_user_endpoints(
    client: AsyncClient,
) -> None:
    await create_student_and_login(client)

    response = await client.get(f"{settings.API_V1_STR}/instructor/users")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = await client.get(
        f"{settings.API_V1_STR}/instructor/users/students"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
