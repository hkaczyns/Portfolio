from fastapi import APIRouter

from app.api.routes.student import (
    attendance,
    calendar,
    class_group,
    enrollment,
    payment,
)

router = APIRouter()
router.include_router(class_group.router)
router.include_router(enrollment.router)
router.include_router(attendance.router)
router.include_router(calendar.router)
router.include_router(payment.router)
