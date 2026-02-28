from fastapi import status
from httpx import AsyncClient

from app.auth.crud import create_user
from app.core.config import get_settings
from app.models.user import UserRole
from app.schemas.user import UserCreate

settings = get_settings()


async def create_verified_user(
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    role: UserRole = UserRole.STUDENT,
    is_superuser: bool = False,
):
    return await create_user(
        UserCreate(
            email=email,
            password=password,
            is_superuser=is_superuser,
            is_verified=True,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )
    )


async def login(client: AsyncClient, email: str, password: str) -> None:
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


async def create_admin_and_login(client: AsyncClient):
    await create_verified_user(
        email="admin@example.com",
        password="Admin_Password1",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        is_superuser=True,
    )
    await login(client, "admin@example.com", "Admin_Password1")


async def create_student_and_login(client: AsyncClient):
    await create_verified_user(
        email="student@example.com",
        password="Student_Password1",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )
    await login(client, "student@example.com", "Student_Password1")


async def create_instructor_and_login(client: AsyncClient):
    await create_verified_user(
        email="instructor@example.com",
        password="Instructor_Password1",
        first_name="Instructor",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    await login(client, "instructor@example.com", "Instructor_Password1")
