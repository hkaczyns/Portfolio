from httpx import AsyncClient
from app.core.config import get_settings
import pytest
from fastapi import status
import logging

settings = get_settings()


@pytest.mark.asyncio
async def test_update_user_when_unauthenticated_fails(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me", json={"firstName": "Updated"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_update_user_when_authenticated_succeeds(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me", json={"firstName": "Updated"}
    )
    assert response.status_code == status.HTTP_200_OK
    updated_user = response.json()
    assert updated_user["firstName"] == "Updated"
    assert updated_user["email"] == "test@example.com"
    assert updated_user["lastName"] == "User"
    assert updated_user["isVerified"] is True
    assert updated_user["id"] == user["id"]


@pytest.mark.asyncio
async def test_update_user_email_requires_current_password(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={"email": "newemail@example.com"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert (
        response.json()["detail"]
        == "You must provide your current password to set a new one."
    )
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "test@example.com"
    assert same_user["isVerified"] is True


@pytest.mark.asyncio
async def test_update_user_email_with_incorrect_current_password_fails(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={
            "email": "newemail@example.com",
            "current_password": "wrong_Password1",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid current password."
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "test@example.com"
    assert same_user["isVerified"] is True


@pytest.mark.asyncio
async def test_update_user_email_with_same_email_fails(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={
            "email": "test@example.com",
            "current_password": "test_Password1",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert (
        response.json()["detail"]["code"] == "UPDATE_USER_EMAIL_ALREADY_SAME"
    )
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "test@example.com"
    assert same_user["isVerified"] is True


@pytest.mark.asyncio
async def test_update_user_email_makes_user_unverified(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True

    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={
            "email": "newemail@example.com",
            "current_password": "test_Password1",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    updated_user = response.json()
    assert updated_user["email"] == "newemail@example.com"
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "newemail@example.com"
    assert same_user["isVerified"] is False


@pytest.mark.asyncio
async def test_update_user_email_sends_a_verification_email(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True

    caplog.clear()
    with caplog.at_level(logging.INFO):
        response = await client.patch(
            f"{settings.API_V1_STR}/users/me",
            json={
                "email": "newemail@example.com",
                "current_password": "test_Password1",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        updated_user = response.json()
        assert updated_user["email"] == "newemail@example.com"
        record = caplog.records[0]
        assert hasattr(record, "email")
        emails = record.email["email"]
        assert len(emails) == 1
        assert emails[0].email == "newemail@example.com"
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
        assert token is not None
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "newemail@example.com"
    assert same_user["isVerified"] is False


@pytest.mark.asyncio
async def test_update_user_password_requires_current_password(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={"password": "new_Password1"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert (
        response.json()["detail"]
        == "You must provide your current password to set a new one."
    )
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "test@example.com"
    assert same_user["isVerified"] is True


@pytest.mark.asyncio
async def test_update_user_password_with_incorrect_current_password_fails(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={
            "password": "new_Password1",
            "current_password": "wrong_Password1",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid current password."
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "test@example.com"
    assert same_user["isVerified"] is True


@pytest.mark.asyncio
async def test_update_user_password_keeps_user_verified(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True
    response = await client.patch(
        f"{settings.API_V1_STR}/users/me",
        json={
            "password": "new_Password1",
            "current_password": "test_Password1",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    updated_user = response.json()
    assert updated_user["email"] == "test@example.com"
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "test@example.com"
    assert same_user["isVerified"] is True


@pytest.mark.asyncio
async def test_update_user_password_sends_email(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True

    caplog.clear()
    with caplog.at_level(logging.INFO):
        response = await client.patch(
            f"{settings.API_V1_STR}/users/me",
            json={
                "password": "new_Password1",
                "current_password": "test_Password1",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        updated_user = response.json()
        assert updated_user["email"] == "test@example.com"
        record = caplog.records[0]
        assert hasattr(record, "email")
        emails = record.email["email"]
        assert len(emails) == 1
        assert emails[0].email == "test@example.com"
        assert "Powiadomienie o zmianie hasła" in record.email["subject"]
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["email"] == "test@example.com"
    assert same_user["isVerified"] is True


@pytest.mark.asyncio
async def test_updating_email_and_password_sends_emails_and_turns_unverified(
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
    user_data = {
        "username": "test@example.com",
        "password": "test_Password1",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    user = get_response.json()
    assert user["email"] == "test@example.com"
    assert user["isVerified"] is True

    caplog.clear()
    with caplog.at_level(logging.INFO):
        response = await client.patch(
            f"{settings.API_V1_STR}/users/me",
            json={
                "firstName": "Updated",
                "email": "newemail@example.com",
                "password": "new_Password1",
                "current_password": "test_Password1",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        updated_user = response.json()
        assert updated_user["email"] == "newemail@example.com"

        record = caplog.records[0]
        assert hasattr(record, "email")
        emails = record.email["email"]
        assert len(emails) == 1
        assert emails[0].email == "newemail@example.com"
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
        assert token is not None

        record = caplog.records[1]
        assert hasattr(record, "email")
        emails = record.email["email"]
        assert len(emails) == 1
        assert emails[0].email == "newemail@example.com"
        assert "Powiadomienie o zmianie hasła" in record.email["subject"]
    another_get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert another_get_response.status_code == status.HTTP_200_OK
    same_user = another_get_response.json()
    assert same_user["firstName"] == "Updated"
    assert same_user["email"] == "newemail@example.com"
    assert same_user["isVerified"] is False


@pytest.mark.asyncio
async def test_normal_user_cannot_make_themselves_superuser(
    caplog, client: AsyncClient
) -> None:
    user1_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
        "lastName": "User",
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user1_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Attempt to make themselves superuser
    update_data = {
        "isSuperuser": True,
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/me", json=update_data
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["isSuperuser"] is False

    get_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["isSuperuser"] is False


@pytest.mark.asyncio
async def test_normal_user_cannot_make_other_users_superuser(
    caplog, client: AsyncClient
) -> None:
    user1_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
        "lastName": "User",
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user1_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user's ID
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    normal_user_id = me_response.json()["id"]

    # Logout normal user
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    user2_data = {
        "email": "anotheruser@example.com",
        "password": "AnotherUser_Password1",
        "firstName": "Another",
        "lastName": "User",
    }
    caplog.clear()
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user2_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "anotheruser@example.com",
            "password": "AnotherUser_Password1",
        },
    )

    # Attempt to make the second user superuser
    update_data = {
        "isSuperuser": True,
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_403_FORBIDDEN
    assert update_response.json()["detail"] == "Forbidden"


@pytest.mark.asyncio
async def test_normal_user_cannot_delete_other_users(
    caplog, client: AsyncClient
) -> None:
    user1_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
        "lastName": "User",
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user1_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT
    # Get normal user's ID
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    normal_user_id = me_response.json()["id"]

    # Logout normal user
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    user2_data = {
        "email": "anotheruser@example.com",
        "password": "AnotherUser_Password1",
        "firstName": "Another",
        "lastName": "User",
    }
    caplog.clear()
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user2_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "anotheruser@example.com",
            "password": "AnotherUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Attempt to delete the first normal user
    delete_response = await client.delete(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert delete_response.status_code == status.HTTP_403_FORBIDDEN
    assert delete_response.json()["detail"] == "Forbidden"


@pytest.mark.asyncio
async def test_normal_user_cannot_update_other_users_info(
    caplog, client: AsyncClient
) -> None:
    user1_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
        "lastName": "User",
    }
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user1_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT
    # Get normal user's ID
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    normal_user_id = me_response.json()["id"]

    # Logout normal user
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    user2_data = {
        "email": "anotheruser@example.com",
        "password": "AnotherUser_Password1",
        "firstName": "Another",
        "lastName": "User",
    }
    caplog.clear()
    with caplog.at_level(logging.INFO):
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register", json=user2_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]
    verify_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "anotheruser@example.com",
            "password": "AnotherUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Attempt to update the first normal user
    update_data = {
        "firstName": "HackedName",
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_403_FORBIDDEN
    assert update_response.json()["detail"] == "Forbidden"
