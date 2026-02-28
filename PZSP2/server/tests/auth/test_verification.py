from httpx import AsyncClient
from pydantic import NameEmail
from app.core.config import get_settings
import pytest
from fastapi import status
import logging

settings = get_settings()


@pytest.mark.asyncio
async def test_register_user_would_send_email(
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
        assert (
            record.getMessage()
            == "Email sending is disabled in the current environment."
        )
        content = record.email
        assert content["email"] == [
            NameEmail(name="Test User", email=user_data["email"])
        ]
        assert content["body"]["first_name"] == "Test"
        assert content["body"]["verification_link"] is not None


@pytest.mark.asyncio
async def test_request_verification_email_would_send_email(
    caplog,
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

    request_verify_data = {
        "email": "test@example.com",
    }

    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/request-verify-token",
            json=request_verify_data,
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        assert (
            record.getMessage()
            == "Email sending is disabled in the current environment."
        )
        content = record.email
        assert content["email"] == [
            NameEmail(name="Test User", email=user_data["email"])
        ]
        assert content["body"]["first_name"] == "Test"
        assert content["body"]["verification_link"] is not None


@pytest.mark.asyncio
async def test_request_verification_email_would_not_send_email_for_nonexistent_user(
    caplog,
    client: AsyncClient,
) -> None:
    request_verify_data = {
        "email": "nonexistent@example.com",
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/request-verify-token",
            json=request_verify_data,
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        assert (
            record.getMessage()
            != "Email sending is disabled in the current environment."
        )
        assert not hasattr(record, "email")
        assert not hasattr(record, "body")


@pytest.mark.asyncio
async def test_verify_user(caplog, client: AsyncClient) -> None:
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
    verify_json = verify_response.json()
    assert verify_json["email"] == user_data["email"]
    assert verify_json["isVerified"] is True
    assert verify_json["firstName"] == user_data["firstName"]
    assert verify_json["lastName"] == user_data["lastName"]
    assert verify_json["id"] is not None
    assert verify_json["isSuperuser"] is False
    assert verify_json["isActive"] is True


@pytest.mark.asyncio
async def test_verify_user_with_invalid_token(client: AsyncClient) -> None:
    response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": "invalid_token"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "VERIFY_USER_BAD_TOKEN"


@pytest.mark.asyncio
async def test_verify_already_verified_user(
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

    second_verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert second_verify_response.status_code == status.HTTP_400_BAD_REQUEST
    assert (
        second_verify_response.json()["detail"]
        == "VERIFY_USER_ALREADY_VERIFIED"
    )
