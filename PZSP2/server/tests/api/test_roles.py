import logging

import pytest
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
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_superuser=is_superuser,
            is_verified=True,
        )
    )


async def login(client: AsyncClient, email: str, password: str) -> None:
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.asyncio
async def test_register_user_role_is_student(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "student@example.com",
        "password": "Student_Password1",
        "firstName": "Student",
        "lastName": "User",
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]

    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK

    await login(client, "student@example.com", "Student_Password1")

    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user = me_response.json()
    assert user["role"] == UserRole.STUDENT.value
    assert user["isSuperuser"] is False


@pytest.mark.asyncio
async def test_cannot_register_with_admin_role(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "student@example.com",
        "password": "Student_Password1",
        "firstName": "Student",
        "lastName": "User",
        "role": UserRole.ADMIN,
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]

    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK

    await login(client, "student@example.com", "Student_Password1")

    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user = me_response.json()
    assert user["role"] == UserRole.STUDENT
    assert user["isSuperuser"] is False


@pytest.mark.asyncio
async def test_cannot_register_with_instructor_role(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "student@example.com",
        "password": "Student_Password1",
        "firstName": "Student",
        "lastName": "User",
        "role": UserRole.INSTRUCTOR,
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]

    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK

    await login(client, "student@example.com", "Student_Password1")

    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user = me_response.json()
    assert user["role"] == UserRole.STUDENT
    assert user["isSuperuser"] is False


@pytest.mark.asyncio
async def test_admin_endpoint_requires_admin(client: AsyncClient) -> None:
    await create_verified_user(
        email="admin@example.com",
        password="Admin_Password1",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        is_superuser=True,
    )
    await login(client, "admin@example.com", "Admin_Password1")

    response = await client.get(f"{settings.API_V1_STR}/admin/ping")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "ok"

    await client.post(f"{settings.API_V1_STR}/auth/logout")

    await create_verified_user(
        email="student2@example.com",
        password="Student_Password2",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )
    await login(client, "student2@example.com", "Student_Password2")

    response = await client.get(f"{settings.API_V1_STR}/admin/ping")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_admin_can_change_user_role(client: AsyncClient) -> None:
    await create_verified_user(
        email="admin2@example.com",
        password="Admin_Password2",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        is_superuser=True,
    )
    target_user = await create_verified_user(
        email="student3@example.com",
        password="Student_Password3",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )

    await login(client, "admin2@example.com", "Admin_Password2")

    response = await client.patch(
        f"{settings.API_V1_STR}/users/{target_user.id}",
        json={"role": UserRole.INSTRUCTOR.value},
    )
    assert response.status_code == status.HTTP_200_OK
    updated = response.json()
    assert updated["role"] == UserRole.INSTRUCTOR.value
    assert updated["isSuperuser"] is False


@pytest.mark.asyncio
async def test_non_admin_cannot_change_user_role(
    client: AsyncClient,
) -> None:
    await create_verified_user(
        email="student4@example.com",
        password="Student_Password4",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )
    target_user = await create_verified_user(
        email="student5@example.com",
        password="Student_Password5",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )

    await login(client, "student4@example.com", "Student_Password4")

    response = await client.patch(
        f"{settings.API_V1_STR}/users/{target_user.id}",
        json={"role": UserRole.ADMIN.value},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_instructor_cannot_change_user_role(
    client: AsyncClient,
) -> None:
    await create_verified_user(
        email="instructor@example.com",
        password="Instructor_Password1",
        first_name="Instructor",
        last_name="User",
        role=UserRole.INSTRUCTOR,
    )
    target_user = await create_verified_user(
        email="student6@example.com",
        password="Student_Password6",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )

    await login(client, "instructor@example.com", "Instructor_Password1")

    response = await client.patch(
        f"{settings.API_V1_STR}/users/{target_user.id}",
        json={"role": UserRole.ADMIN.value},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_role_and_superuser_sync(client: AsyncClient) -> None:
    await create_verified_user(
        email="admin3@example.com",
        password="Admin_Password3",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        is_superuser=True,
    )
    user_role_only = await create_verified_user(
        email="student7@example.com",
        password="Student_Password7",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )
    user_super_only = await create_verified_user(
        email="student8@example.com",
        password="Student_Password8",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )

    await login(client, "admin3@example.com", "Admin_Password3")

    response = await client.patch(
        f"{settings.API_V1_STR}/users/{user_role_only.id}",
        json={"role": UserRole.ADMIN.value},
    )
    assert response.status_code == status.HTTP_200_OK
    updated = response.json()
    assert updated["role"] == UserRole.ADMIN.value
    assert updated["isSuperuser"] is True

    response = await client.patch(
        f"{settings.API_V1_STR}/users/{user_super_only.id}",
        json={"isSuperuser": True},
    )
    assert response.status_code == status.HTTP_200_OK
    updated = response.json()
    assert updated["role"] == UserRole.ADMIN.value
    assert updated["isSuperuser"] is True


@pytest.mark.asyncio
async def test_update_me_cannot_change_role(
    client: AsyncClient,
) -> None:
    await create_verified_user(
        email="student9@example.com",
        password="Student_Password9",
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
    )
    await login(client, "student9@example.com", "Student_Password9")

    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={"firstName": "Updated", "role": UserRole.ADMIN.value},
    )
    assert response.status_code == status.HTTP_200_OK
    updated = response.json()
    assert updated["firstName"] == "Updated"
    assert updated["role"] == UserRole.STUDENT.value
    assert updated["isSuperuser"] is False
