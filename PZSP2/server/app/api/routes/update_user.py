from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_users import BaseUserManager, exceptions
from fastapi_users.router.common import ErrorCode
from enum import Enum

from app.auth.users import get_user_manager, current_user, current_superuser

from app.schemas.user import UserRead, UserUpdate, UserUpdateSecure
from app.models.user import User, UserRole

router = APIRouter()


class TipTapErrorCode(str, Enum):
    UPDATE_USER_EMAIL_ALREADY_SAME = "UPDATE_USER_EMAIL_ALREADY_SAME"


@router.patch("/me", response_model=UserRead)
async def update_me_securely(
    user_update: UserUpdateSecure,
    user: User = Depends(current_user),
    user_manager: BaseUserManager = Depends(get_user_manager),
):
    """
    Overwritten PATCH /me endpoint.
    Forces 'current_password' verification if the user tries to change sensitive fields.
    """

    update_data = user_update.model_dump(exclude_unset=True)

    if "role" in update_data:
        update_data.pop("role")

    if "password" in update_data or "email" in update_data:
        current_password = update_data.pop("current_password", None)

        if not current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must provide your current password to set a new one.",
            )

        if "email" in update_data and update_data["email"] == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": TipTapErrorCode.UPDATE_USER_EMAIL_ALREADY_SAME,
                    "reason": "The new email address must be different from the current one.",
                },
            )

        verified_user = await user_manager.authenticate(
            credentials=OAuth2PasswordRequestForm(
                username=user.email, password=current_password
            )
        )

        if not verified_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid current password.",
            )

    if "current_password" in update_data:
        del update_data["current_password"]

    try:
        updated_user = await user_manager.update(
            user_update=UserUpdate(**update_data), user=user, safe=True
        )
    except exceptions.InvalidPasswordException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": ErrorCode.UPDATE_USER_INVALID_PASSWORD,
                "reason": e.reason,
            },
        )
    except exceptions.UserAlreadyExists:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=ErrorCode.UPDATE_USER_EMAIL_ALREADY_EXISTS,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Update failed: {str(e)}",
        )

    return updated_user


async def get_user_or_404(
    id: str,
    user_manager: BaseUserManager = Depends(get_user_manager),
) -> User:
    try:
        parsed_id = user_manager.parse_id(id)
        return await user_manager.get(parsed_id)
    except (exceptions.UserNotExists, exceptions.InvalidID) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND) from e


@router.patch(
    "/{id}",
    response_model=UserRead,
    dependencies=[Depends(current_superuser)],
)
async def update_user(
    user_update: UserUpdate,
    request: Request,
    user: User = Depends(get_user_or_404),
    user_manager: BaseUserManager = Depends(get_user_manager),
):
    update_data = user_update.model_dump(exclude_unset=True)

    if (
        update_data.get("role") == UserRole.ADMIN
        or update_data.get("is_superuser") is True
    ):
        update_data["role"] = UserRole.ADMIN
        update_data["is_superuser"] = True
    elif update_data.get("role") in {
        UserRole.STUDENT,
        UserRole.INSTRUCTOR,
    }:
        update_data["is_superuser"] = False
    elif update_data.get("is_superuser") is False:
        if user.role == UserRole.ADMIN:
            update_data["role"] = UserRole.STUDENT

    try:
        updated_user = await user_manager.update(
            user_update=UserUpdate(**update_data),
            user=user,
            safe=False,
            request=request,
        )
    except exceptions.InvalidPasswordException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": ErrorCode.UPDATE_USER_INVALID_PASSWORD,
                "reason": e.reason,
            },
        )
    except exceptions.UserAlreadyExists:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=ErrorCode.UPDATE_USER_EMAIL_ALREADY_EXISTS,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Update failed: {str(e)}",
        )

    return updated_user
