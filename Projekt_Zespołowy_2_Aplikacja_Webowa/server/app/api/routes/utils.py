from fastapi import APIRouter

router = APIRouter(tags=["utils"], prefix="/utils")


@router.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
