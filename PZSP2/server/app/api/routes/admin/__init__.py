from fastapi import APIRouter, Depends

from app.api.routes.admin import (
    attendance,
    calendar,
    charge,
    enrollment,
    payment,
    schedule,
    users,
)
from app.auth.users import current_superuser
from app.models.user import User

router = APIRouter(tags=["admin"], prefix="/admin")
router.include_router(schedule.router)
router.include_router(calendar.router)
router.include_router(enrollment.router)
router.include_router(attendance.router)
router.include_router(charge.router)
router.include_router(payment.router)
router.include_router(users.router)


@router.get("/ping")
async def admin_ping(user: User = Depends(current_superuser)) -> dict:
    return {"status": "ok"}
