from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.contact import ContactInfo

router = APIRouter(prefix="/public", tags=["public"])
settings = get_settings()

OPEN_HOURS = (
    "Wtorek 18:00-22:00\n"
    "Środa 18:00-22:00\n"
    "Czwartek 17:00-22:00\n"
    "Sobota 9:00-17:00"
)


@router.get("/contact", response_model=ContactInfo)
async def get_contact_info() -> ContactInfo:
    return ContactInfo(
        contact_email=settings.FIRST_SUPERUSER_EMAIL,
        phone_number="+48 693 273 379",
        address="ul. Kinowa 19",
        open_hours=OPEN_HOURS,
    )
