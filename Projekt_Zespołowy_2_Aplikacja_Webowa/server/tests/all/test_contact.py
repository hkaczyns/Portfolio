import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings

settings = get_settings()

OPEN_HOURS = (
    "Wtorek 18:00-22:00\n"
    "Środa 18:00-22:00\n"
    "Czwartek 17:00-22:00\n"
    "Sobota 9:00-17:00"
)


@pytest.mark.asyncio
async def test_public_contact_info(client: AsyncClient) -> None:
    response = await client.get(f"{settings.API_V1_STR}/public/contact")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "contact_email": str(settings.FIRST_SUPERUSER_EMAIL),
        "phone_number": "+48 693 273 379",
        "address": "ul. Kinowa 19",
        "open_hours": OPEN_HOURS,
    }
