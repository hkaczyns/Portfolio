from fastapi import APIRouter

from app.api.routes.all import contact, schedule, semester, skill_level, topic

router = APIRouter()
router.include_router(contact.router)
router.include_router(schedule.router)
router.include_router(skill_level.router)
router.include_router(topic.router)
router.include_router(semester.router)
