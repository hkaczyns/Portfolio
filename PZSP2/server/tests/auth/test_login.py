import logging
from httpx import AsyncClient
from app.core.config import get_settings
import pytest
from fastapi import status

settings = get_settings()


@pytest.mark.asyncio
async def test_login_verified_user(caplog, client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_Password1",
        "firstName": "Test",
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

    user_data = {"username": "test@example.com", "password": "test_Password1"}
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.asyncio
async def test_login_unverified_user(client: AsyncClient) -> None:
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
    user_data = {"username": "test@example.com", "password": "test_Password1"}
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "LOGIN_USER_NOT_VERIFIED"


@pytest.mark.asyncio
async def test_login_verified_user_invalid_credentials(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_Password1",
        "firstName": "Test",
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
    user_data = {"username": "test@example.com", "password": "wrong_password"}
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_unverified_user_invalid_credentials(
    client: AsyncClient,
) -> None:
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
    user_data = {"username": "test@example.com", "password": "wrong_password"}
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_verified_user_nonexistent_email(
    caplog,
    client: AsyncClient,
) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_Password1",
        "firstName": "Test",
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
    user_data = {
        "username": "nonexistent@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_unverified_user_nonexistent_email(
    client: AsyncClient,
) -> None:
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
    user_data = {
        "username": "nonexistent@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"
