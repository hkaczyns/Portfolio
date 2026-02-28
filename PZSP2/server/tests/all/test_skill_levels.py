import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from tests.admin.helpers import create_admin_and_login

settings = get_settings()


@pytest.mark.asyncio
async def test_public_skill_levels_list(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    response_one = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/skill-levels",
        json={"name": "Beginner", "description": "Start"},
    )
    assert response_one.status_code == status.HTTP_201_CREATED
    response_two = await client.post(
        f"{settings.API_V1_STR}/admin/schedule/skill-levels",
        json={"name": "Advanced", "description": "Pro"},
    )
    assert response_two.status_code == status.HTTP_201_CREATED

    client.cookies.clear()

    list_response = await client.get(
        f"{settings.API_V1_STR}/public/skill-levels"
    )
    assert list_response.status_code == status.HTTP_200_OK
    payload = list_response.json()
    assert len(payload) == 2
    for item in payload:
        assert set(item.keys()) == {"id", "name"}
    ids = {item["id"] for item in payload}
    assert ids == {response_one.json()["id"], response_two.json()["id"]}
