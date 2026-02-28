import logging
from httpx import AsyncClient
from app.core.config import get_settings
import pytest
from fastapi import status

settings = get_settings()


@pytest.mark.asyncio
async def test_reset_password_email_sent_verified_logged(
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

    user_data = {"username": "test@example.com", "password": "test_Password1"}
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    caplog.clear()

    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        assert (
            record.getMessage()
            == "Email sending is disabled in the current environment."
        )
        assert record.email["body"]["first_name"] == "Test"
        reset_link = record.email["body"]["reset_password_link"]
        assert "reset-password" in reset_link


@pytest.mark.asyncio
async def test_reset_password_email_sent_verified_unlogged(
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
    caplog.clear()

    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        assert (
            record.getMessage()
            == "Email sending is disabled in the current environment."
        )
        assert record.email["body"]["first_name"] == "Test"
        reset_link = record.email["body"]["reset_password_link"]
        assert "reset-password" in reset_link


@pytest.mark.asyncio
async def test_reset_password_email_sent_unverified(
    caplog, client: AsyncClient
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
    caplog.clear()

    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        assert (
            record.getMessage()
            == "Email sending is disabled in the current environment."
        )
        assert record.email["body"]["first_name"] == "Test"
        reset_link = record.email["body"]["reset_password_link"]
        assert "reset-password" in reset_link


@pytest.mark.asyncio
async def test_reset_password_email_sent_nonexistent_email(
    caplog, client: AsyncClient
) -> None:
    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        assert (
            record.getMessage()
            == 'HTTP Request: POST http://testserver/api/v1/auth/forgot-password "HTTP/1.1 202 Accepted"'
        )
        assert not hasattr(record, "email")  # No email sent


@pytest.mark.asyncio
async def test_reset_password_with_valid_token(
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
    caplog.clear()
    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        reset_link = record.email["body"]["reset_password_link"]
        reset_token = reset_link.split("/reset-password/")[-1]
    new_password_data = {
        "token": reset_token,
        "password": "New_test_Password1",
    }
    reset_password_response = await client.post(
        f"{settings.API_V1_STR}/auth/reset-password", json=new_password_data
    )
    assert reset_password_response.status_code == status.HTTP_200_OK
    assert reset_password_response.json() is None


@pytest.mark.asyncio
async def test_reset_password_with_invalid_token(
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
    caplog.clear()
    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
    new_password_data = {
        "token": "invalidtoken123",
        "password": "New_test_Password1",
    }
    reset_password_response = await client.post(
        f"{settings.API_V1_STR}/auth/reset-password", json=new_password_data
    )
    assert reset_password_response.status_code == status.HTTP_400_BAD_REQUEST
    assert (
        reset_password_response.json()["detail"] == "RESET_PASSWORD_BAD_TOKEN"
    )


@pytest.mark.asyncio
async def test_reset_password_with_valid_token_incorrect_password(
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
    caplog.clear()
    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        reset_link = record.email["body"]["reset_password_link"]
        reset_token = reset_link.split("/reset-password/")[-1]
    new_password_data = {
        "token": reset_token,
        "password": "short",
    }
    reset_password_response = await client.post(
        f"{settings.API_V1_STR}/auth/reset-password", json=new_password_data
    )
    assert reset_password_response.status_code == status.HTTP_400_BAD_REQUEST
    assert (
        reset_password_response.json()["detail"]["code"]
        == "RESET_PASSWORD_INVALID_PASSWORD"
    )


@pytest.mark.asyncio
async def login_with_new_password_after_reset(
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
    caplog.clear()
    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        reset_link = record.email["body"]["reset_password_link"]
        reset_token = reset_link.split("/reset-password/")[-1]
    new_password_data = {
        "token": reset_token,
        "password": "New_test_Password1",
    }
    reset_password_response = await client.post(
        f"{settings.API_V1_STR}/auth/reset-password", json=new_password_data
    )
    assert reset_password_response.status_code == status.HTTP_200_OK
    assert reset_password_response.json() is None

    login_data = {
        "username": "test@example.com",
        "password": "New_test_Password1",
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=login_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.asyncio
async def login_with_old_password_after_reset_fails(
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
    caplog.clear()
    with caplog.at_level(logging.INFO):
        reset_response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": "test@example.com"},
        )
        assert reset_response.status_code == status.HTTP_202_ACCEPTED
        record = caplog.records[0]
        reset_link = record.email["body"]["reset_password_link"]
        reset_token = reset_link.split("/reset-password/")[-1]
    new_password_data = {
        "token": reset_token,
        "password": "New_test_Password1",
    }
    reset_password_response = await client.post(
        f"{settings.API_V1_STR}/auth/reset-password", json=new_password_data
    )
    assert reset_password_response.status_code == status.HTTP_200_OK
    assert reset_password_response.json() is None

    login_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=login_data
    )
    assert login_response.status_code == status.HTTP_400_BAD_REQUEST
    assert login_response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"
