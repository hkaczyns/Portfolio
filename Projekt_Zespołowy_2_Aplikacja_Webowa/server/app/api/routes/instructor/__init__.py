from fastapi import APIRouter

from app.api.routes.instructor import calendar, schedule, session, users

router = APIRouter()
router.include_router(calendar.router)
router.include_router(schedule.router)
router.include_router(session.router)
router.include_router(users.router)
