from httpx import AsyncClient
from app.core.config import get_settings
import pytest

settings = get_settings()


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    response = await client.get(f"{settings.API_V1_STR}/utils/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
