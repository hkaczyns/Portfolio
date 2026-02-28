import logging
from httpx import AsyncClient
from app.core.config import get_settings
import pytest
from fastapi import status

settings = get_settings()


@pytest.mark.asyncio
async def test_superuser_is_created_at_launch(client: AsyncClient) -> None:
    user_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.asyncio
async def test_superuser_invalid_credentials(client: AsyncClient) -> None:
    user_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": "wrong_password",
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"


@pytest.mark.asyncio
async def test_superuser_login_missing_fields(client: AsyncClient) -> None:
    user_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json()["detail"][0]["loc"] == ["body", "password"]
    assert response.json()["detail"][0]["msg"] == "Field required"


@pytest.mark.asyncio
async def test_superuser_is_verified_and_superuser(
    client: AsyncClient,
) -> None:
    user_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == status.HTTP_200_OK
    user_info = response.json()
    assert user_info["email"] == settings.FIRST_SUPERUSER_EMAIL
    assert user_info["isSuperuser"] is True
    assert user_info["isVerified"] is True
    assert user_info["isActive"] is True


@pytest.mark.asyncio
async def test_superuser_logout(client: AsyncClient) -> None:
    user_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=user_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_superuser_can_get_other_users_details(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"
    assert get_response.json()["isSuperuser"] is False
    assert get_response.json()["isVerified"] is True
    assert get_response.json()["isActive"] is True
    assert get_response.json()["firstName"] == "Normal"
    assert get_response.json()["lastName"] == "User"


@pytest.mark.asyncio
async def test_superuser_can_delete_other_users(
    caplog, client: AsyncClient
) -> None:
    # Register a normal user
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"

    # Delete normal user
    delete_response = await client.delete(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify normal user is deleted
    get_user_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_user_response.status_code == status.HTTP_404_NOT_FOUND

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify normal user cannot login
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_400_BAD_REQUEST
    assert login_response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"


@pytest.mark.asyncio
async def test_superuser_can_update_other_users_nonsensitive_info(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"
    assert get_response.json()["isSuperuser"] is False
    assert get_response.json()["isVerified"] is True
    assert get_response.json()["isActive"] is True
    assert get_response.json()["firstName"] == "Normal"
    assert get_response.json()["lastName"] == "User"

    # Update normal user's first and last name
    update_data = {
        "firstName": "UpdatedNormal",
        "lastName": "UpdatedUser",
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["firstName"] == "UpdatedNormal"
    assert update_response.json()["lastName"] == "UpdatedUser"
    assert update_response.json()["email"] == "normaluser@example.com"
    assert update_response.json()["isSuperuser"] is False
    assert update_response.json()["isVerified"] is True
    assert update_response.json()["isActive"] is True

    get_updated_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_updated_response.status_code == status.HTTP_200_OK
    assert get_updated_response.json()["firstName"] == "UpdatedNormal"
    assert get_updated_response.json()["lastName"] == "UpdatedUser"
    assert get_updated_response.json()["email"] == "normaluser@example.com"
    assert get_updated_response.json()["isSuperuser"] is False
    assert get_updated_response.json()["isVerified"] is True
    assert get_updated_response.json()["isActive"] is True

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Login as normal user
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user_info = me_response.json()
    assert user_info["firstName"] == "UpdatedNormal"
    assert user_info["lastName"] == "UpdatedUser"
    assert user_info["email"] == "normaluser@example.com"
    assert user_info["isSuperuser"] is False
    assert user_info["isVerified"] is True
    assert user_info["isActive"] is True


@pytest.mark.asyncio
async def test_superuser_can_update_other_users_email_address(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"
    assert get_response.json()["isSuperuser"] is False
    assert get_response.json()["isVerified"] is True
    assert get_response.json()["isActive"] is True
    assert get_response.json()["firstName"] == "Normal"
    assert get_response.json()["lastName"] == "User"

    # Update normal user's first and last name
    update_data = {
        "firstName": "UpdatedNormal",
        "email": "updatednormal@example.com",
    }
    caplog.clear()
    with caplog.at_level(logging.INFO):
        update_response = await client.patch(
            f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.json()["firstName"] == "UpdatedNormal"
        assert update_response.json()["lastName"] == "User"
        assert update_response.json()["email"] == "updatednormal@example.com"
        assert update_response.json()["isSuperuser"] is False
        assert update_response.json()["isVerified"] is False
        assert update_response.json()["isActive"] is True
        record = caplog.records[0]
        verification_link = record.email["body"]["verification_link"]
        token = verification_link.split("/verification/")[-1]

        get_updated_response = await client.get(
            f"{settings.API_V1_STR}/users/{normal_user_id}"
        )
        assert get_updated_response.status_code == status.HTTP_200_OK
        assert get_updated_response.json()["firstName"] == "UpdatedNormal"
        assert get_updated_response.json()["isVerified"] is False
    verify_update_response = await client.post(
        f"{settings.API_V1_STR}/auth/verify", json={"token": token}
    )
    assert verify_update_response.status_code == status.HTTP_200_OK

    get_updated_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_updated_response.status_code == status.HTTP_200_OK
    assert get_updated_response.json()["firstName"] == "UpdatedNormal"
    assert get_updated_response.json()["lastName"] == "User"
    assert get_updated_response.json()["email"] == "updatednormal@example.com"
    assert get_updated_response.json()["isSuperuser"] is False
    assert get_updated_response.json()["isVerified"] is True
    assert get_updated_response.json()["isActive"] is True

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Login as normal user
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_400_BAD_REQUEST
    assert login_response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"

    # Login with updated email
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "updatednormal@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user_info = me_response.json()
    assert user_info["firstName"] == "UpdatedNormal"
    assert user_info["lastName"] == "User"
    assert user_info["email"] == "updatednormal@example.com"
    assert user_info["isSuperuser"] is False
    assert user_info["isVerified"] is True
    assert user_info["isActive"] is True


@pytest.mark.asyncio
async def test_superuser_can_update_other_users_password(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"
    assert get_response.json()["isSuperuser"] is False
    assert get_response.json()["isVerified"] is True
    assert get_response.json()["isActive"] is True
    assert get_response.json()["firstName"] == "Normal"
    assert get_response.json()["lastName"] == "User"

    # Update normal user's first and last name
    update_data = {
        "firstName": "UpdatedNormal",
        "password": "UpdatedPassword1",
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["firstName"] == "UpdatedNormal"
    assert update_response.json()["lastName"] == "User"
    assert update_response.json()["email"] == "normaluser@example.com"
    assert update_response.json()["isSuperuser"] is False
    assert update_response.json()["isVerified"] is True
    assert update_response.json()["isActive"] is True

    get_updated_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_updated_response.status_code == status.HTTP_200_OK
    assert get_updated_response.json()["firstName"] == "UpdatedNormal"
    assert get_updated_response.json()["lastName"] == "User"
    assert get_updated_response.json()["email"] == "normaluser@example.com"
    assert get_updated_response.json()["isSuperuser"] is False
    assert get_updated_response.json()["isVerified"] is True
    assert get_updated_response.json()["isActive"] is True

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Login as normal user
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_400_BAD_REQUEST
    assert login_response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"

    # Login with updated password
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "UpdatedPassword1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user_info = me_response.json()
    assert user_info["firstName"] == "UpdatedNormal"
    assert user_info["lastName"] == "User"
    assert user_info["email"] == "normaluser@example.com"
    assert user_info["isSuperuser"] is False
    assert user_info["isVerified"] is True
    assert user_info["isActive"] is True


@pytest.mark.asyncio
async def test_superuser_can_make_other_users_superuser(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"
    assert get_response.json()["isSuperuser"] is False
    assert get_response.json()["isVerified"] is True
    assert get_response.json()["isActive"] is True
    assert get_response.json()["firstName"] == "Normal"
    assert get_response.json()["lastName"] == "User"

    # Update normal user's first and last name
    update_data = {
        "firstName": "UpdatedNormal",
        "isSuperuser": True,
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["firstName"] == "UpdatedNormal"
    assert update_response.json()["lastName"] == "User"
    assert update_response.json()["email"] == "normaluser@example.com"
    assert update_response.json()["isSuperuser"] is True
    assert update_response.json()["isVerified"] is True
    assert update_response.json()["isActive"] is True

    get_updated_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_updated_response.status_code == status.HTTP_200_OK
    assert get_updated_response.json()["firstName"] == "UpdatedNormal"
    assert get_updated_response.json()["lastName"] == "User"
    assert get_updated_response.json()["email"] == "normaluser@example.com"
    assert get_updated_response.json()["isSuperuser"] is True
    assert get_updated_response.json()["isVerified"] is True
    assert get_updated_response.json()["isActive"] is True

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Login as normal user
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user_info = me_response.json()
    assert user_info["firstName"] == "UpdatedNormal"
    assert user_info["lastName"] == "User"
    assert user_info["email"] == "normaluser@example.com"
    assert user_info["isSuperuser"] is True
    assert user_info["isVerified"] is True
    assert user_info["isActive"] is True


@pytest.mark.asyncio
async def test_superuser_can_make_other_users_inactive(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"
    assert get_response.json()["isSuperuser"] is False
    assert get_response.json()["isVerified"] is True
    assert get_response.json()["isActive"] is True
    assert get_response.json()["firstName"] == "Normal"
    assert get_response.json()["lastName"] == "User"

    # Update normal user's first and last name
    update_data = {
        "firstName": "UpdatedNormal",
        "isActive": False,
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["firstName"] == "UpdatedNormal"
    assert update_response.json()["lastName"] == "User"
    assert update_response.json()["email"] == "normaluser@example.com"
    assert update_response.json()["isSuperuser"] is False
    assert update_response.json()["isVerified"] is True
    assert update_response.json()["isActive"] is False

    get_updated_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_updated_response.status_code == status.HTTP_200_OK
    assert get_updated_response.json()["firstName"] == "UpdatedNormal"
    assert get_updated_response.json()["lastName"] == "User"
    assert get_updated_response.json()["email"] == "normaluser@example.com"
    assert get_updated_response.json()["isSuperuser"] is False
    assert get_updated_response.json()["isVerified"] is True
    assert get_updated_response.json()["isActive"] is False

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Login as normal user
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_400_BAD_REQUEST
    assert login_response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"


@pytest.mark.asyncio
async def test_superuser_can_make_inactive_users_active(
    caplog, client: AsyncClient
) -> None:
    user_data = {
        "email": "normaluser@example.com",
        "password": "NormalUser_Password1",
        "firstName": "Normal",
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

    # Login as superuser
    superuser_data = {
        "username": settings.FIRST_SUPERUSER_EMAIL,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Get normal user details
    get_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["email"] == "normaluser@example.com"
    assert get_response.json()["isSuperuser"] is False
    assert get_response.json()["isVerified"] is True
    assert get_response.json()["isActive"] is True
    assert get_response.json()["firstName"] == "Normal"
    assert get_response.json()["lastName"] == "User"

    # Update normal user's first and last name
    update_data = {
        "firstName": "UpdatedNormal",
        "isActive": False,
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["firstName"] == "UpdatedNormal"
    assert update_response.json()["lastName"] == "User"
    assert update_response.json()["email"] == "normaluser@example.com"
    assert update_response.json()["isSuperuser"] is False
    assert update_response.json()["isVerified"] is True
    assert update_response.json()["isActive"] is False

    get_updated_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_updated_response.status_code == status.HTTP_200_OK
    assert get_updated_response.json()["firstName"] == "UpdatedNormal"
    assert get_updated_response.json()["lastName"] == "User"
    assert get_updated_response.json()["email"] == "normaluser@example.com"
    assert get_updated_response.json()["isSuperuser"] is False
    assert get_updated_response.json()["isVerified"] is True
    assert get_updated_response.json()["isActive"] is False

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Login as normal user
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_400_BAD_REQUEST
    assert login_response.json()["detail"] == "LOGIN_BAD_CREDENTIALS"

    # Login as superuser
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login", data=superuser_data
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT

    # Make normal user active again
    update_data = {
        "isActive": True,
    }
    update_response = await client.patch(
        f"{settings.API_V1_STR}/users/{normal_user_id}", json=update_data
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["isActive"] is True

    get_updated_response = await client.get(
        f"{settings.API_V1_STR}/users/{normal_user_id}"
    )
    assert get_updated_response.status_code == status.HTTP_200_OK
    assert get_updated_response.json()["isActive"] is True

    # Logout superuser
    logout_response = await client.post(f"{settings.API_V1_STR}/auth/logout")
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Login as normal user
    login_response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "normaluser@example.com",
            "password": "NormalUser_Password1",
        },
    )
    assert login_response.status_code == status.HTTP_204_NO_CONTENT
    me_response = await client.get(f"{settings.API_V1_STR}/users/me")
    assert me_response.status_code == status.HTTP_200_OK
    user_info = me_response.json()
    assert user_info["firstName"] == "UpdatedNormal"
    assert user_info["lastName"] == "User"
    assert user_info["email"] == "normaluser@example.com"
    assert user_info["isSuperuser"] is False
    assert user_info["isVerified"] is True
    assert user_info["isActive"] is True
