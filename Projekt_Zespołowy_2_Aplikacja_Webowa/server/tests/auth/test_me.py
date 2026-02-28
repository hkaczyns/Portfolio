import logging
from httpx import AsyncClient
from app.core.config import get_settings
import pytest
from fastapi import status

settings = get_settings()


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient) -> None:
    response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_me_authenticated_unverified(client: AsyncClient) -> None:
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
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "LOGIN_USER_NOT_VERIFIED"
    response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_me_authenticated_verified(caplog, client: AsyncClient) -> None:
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
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == status.HTTP_200_OK
    user_info = response.json()
    assert user_info["email"] == "test@example.com"
    assert user_info["firstName"] == "Test"
    assert user_info["lastName"] == "User"
    assert "id" in user_info


@pytest.mark.asyncio
async def test_me_among_users(caplog, client: AsyncClient) -> None:
    user_data = {
        "email": "test@example.com",
        "password": "test_Password1",
        "firstName": "Test",
        "lastName": "User",
    }
    user2_data = {
        "email": "test2@example.com",
        "password": "test_Password1",
        "firstName": "Test2",
        "lastName": "User2",
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    caplog.records.clear()

    with caplog.at_level(logging.INFO):
        response2 = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user2_data
        )
        assert response2.status_code == status.HTTP_201_CREATED
        record2 = caplog.records[0]
        verification_link2 = record2.email["body"]["verification_link"]
        token2 = verification_link2.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    verify_response2 = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token2}
    )
    assert verify_response2.status_code == status.HTTP_200_OK
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == status.HTTP_200_OK
    user_info = response.json()
    assert user_info["email"] == "test@example.com"
    assert user_info["firstName"] == "Test"
    assert user_info["lastName"] == "User"
