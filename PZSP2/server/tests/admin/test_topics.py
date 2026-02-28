import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.user import UserRole
from tests.admin.helpers import (
    create_admin_and_login,
    create_instructor_and_login,
    create_student_and_login,
)

settings = get_settings()


@pytest.mark.asyncio
async def test_admin_can_manage_topics(client: AsyncClient) -> None:
    await create_admin_and_login(client)

    payload = {"name": "Hip-hop", "description": "Podstawy rytmu"}
    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/topics",
        json=payload,
    )
    assert response.status_code == status.HTTP_201_CREATED
    topic = response.json()
    assert topic["name"] == payload["name"]

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/topics"
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert any(item["id"] == topic["id"] for item in list_response.json())

    update_response = await client.patch(
        f"{settings.API_V1_STR}/admin/schedule/topics/{topic['id']}",
        json={"description": "Zaawansowane kroki"},
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["description"] == "Zaawansowane kroki"

    delete_response = await client.delete(
        f"{settings.API_V1_STR}/admin/schedule/topics/{topic['id']}"
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    list_after_delete = await client.get(
        f"{settings.API_V1_STR}/admin/schedule/topics"
    )
    assert list_after_delete.status_code == status.HTTP_200_OK
    assert list_after_delete.json() == []


@pytest.mark.asyncio
@pytest.mark.parametrize("role", [UserRole.STUDENT, UserRole.INSTRUCTOR])
async def test_non_admin_cannot_manage_topics(
    client: AsyncClient, role: UserRole
) -> None:
    if role == UserRole.STUDENT:
        await create_student_and_login(client)
    else:
        await create_instructor_and_login(client)

    payload = {"name": "Jazz", "description": "Improwizacja"}

    response = await client.get(f"{settings.API_V1_STR}/admin/schedule/topics")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/topics",
        json=payload,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = await client.delete(
        f"{settings.API_V1_STR}/admin/schedule/topics/1"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
