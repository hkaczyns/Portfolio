from httpx import AsyncClient
from app.core.config import get_settings
import pytest
from fastapi import status

settings = get_settings()


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_Password1",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )

    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.asyncio
async def test_register_user_invalid_email(client: AsyncClient) -> None:
    user_data = {
        "email": "invalid-email",
        "password": "test_Password1",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


@pytest.mark.asyncio
async def test_register_user_password_too_short(client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "Short1",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"]["code"] == "REGISTER_INVALID_PASSWORD"


@pytest.mark.asyncio
async def test_register_user_password_no_digit(client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_Password",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"]["code"] == "REGISTER_INVALID_PASSWORD"


@pytest.mark.asyncio
async def test_register_user_password_no_uppercase(
    client: AsyncClient,
) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_password1",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"]["code"] == "REGISTER_INVALID_PASSWORD"


@pytest.mark.asyncio
async def test_register_user_user_exists(client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_Password1",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )
    assert response.status_code == status.HTTP_201_CREATED
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "REGISTER_USER_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_register_user_missing_password(client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json()["detail"][0]["msg"] == "Field required"
    assert response.json()["detail"][0]["type"] == "missing"


@pytest.mark.asyncio
async def test_register_user_missing_email(client: AsyncClient) -> None:
    user_data = {
        "password": "test_Password1",
        "firstName": "Test",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json()["detail"][0]["msg"] == "Field required"
    assert response.json()["detail"][0]["type"] == "missing"


@pytest.mark.asyncio
async def test_register_user_missing_first_name(client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_password",
        "lastName": "User",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json()["detail"][0]["msg"] == "Field required"
    assert response.json()["detail"][0]["type"] == "missing"


@pytest.mark.asyncio
async def test_register_user_missing_last_name(client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_password",
        "firstName": "Test",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json()["detail"][0]["msg"] == "Field required"
    assert response.json()["detail"][0]["type"] == "missing"
