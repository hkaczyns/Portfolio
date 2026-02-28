from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi_users import BaseUserManager, exceptions
from fastapi_users.router.common import ErrorCode
from app.api.routes import (
    utils,
    all as all_routes,
    private,
    update_user,
    admin,
    student,
    instructor,
)
from app.core.config import get_settings
from app.auth.users import (
    auth_backend,
    current_user,
    fastapi_users,
    get_user_manager,
)
from app.schemas.user import UserRead, UserCreate, UserUpdate

api_router = APIRouter()
api_router.include_router(utils.router)
api_router.include_router(all_routes.router)
api_router.include_router(admin.router)
api_router.include_router(student.router)
api_router.include_router(instructor.router)
api_router.include_router(update_user.router, prefix="/users", tags=["users"])

api_router.include_router(
    fastapi_users.get_auth_router(auth_backend, requires_verification=True),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

api_router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)


@api_router.get("/verify", tags=["auth"])
async def verify_email(
    token: str,
    request: Request,
    user_manager: BaseUserManager = Depends(get_user_manager),
):
    try:
        await user_manager.verify(token, request)
        return {"status": "verified"}
    except (exceptions.InvalidVerifyToken, exceptions.UserNotExists):
        raise HTTPException(
            status_code=400,
            detail=ErrorCode.VERIFY_USER_BAD_TOKEN,
        )
    except exceptions.UserAlreadyVerified:
        raise HTTPException(
            status_code=400,
            detail=ErrorCode.VERIFY_USER_ALREADY_VERIFIED,
        )


# Example protected endpoint
@api_router.get("/me", response_model=UserRead, tags=["users"])
async def read_me(user=Depends(current_user)):
    return user


settings = get_settings()
if settings.APP_ENV == "development":
    api_router.include_router(private.router)
