from typing import Any
import uuid
from fastapi import Request
from fastapi_users import (
    BaseUserManager,
    InvalidPasswordException,
    UUIDIDMixin,
    schemas,
)
from fastapi_users.jwt import generate_jwt
from app.models.user import User, UserRole
from app.core.config import get_settings
from app.email.send_email import (
    send_password_change_notification_email,
    send_updated_email_verification_email,
    send_verification_email,
    send_reset_password_email,
)

settings = get_settings()


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.RESET_PASSWORD_SECRET
    verification_token_secret = settings.VERIFICATION_TOKEN_SECRET

    async def create(
        self,
        user_create: schemas.BaseUserCreate,
        safe: bool = False,
        request: Request | None = None,
    ) -> User:
        if hasattr(user_create, "role"):
            if safe:
                user_create = user_create.model_copy(
                    update={"role": UserRole.STUDENT}
                )
            else:
                updates: dict[str, object] = {}
                role = getattr(user_create, "role", None)
                is_superuser = getattr(user_create, "is_superuser", None)
                if role == UserRole.ADMIN and not is_superuser:
                    updates["is_superuser"] = True
                elif is_superuser and role != UserRole.ADMIN:
                    updates["role"] = UserRole.ADMIN
                if updates:
                    user_create = user_create.model_copy(update=updates)

        return await super().create(
            user_create=user_create, safe=safe, request=request
        )

    async def validate_password(
        self, password: str, user: schemas.BaseUserCreate | User
    ) -> None:
        if len(password) < 8:
            raise InvalidPasswordException(
                "Password should be at least 8 characters"
            )
        if not any(char.isdigit() for char in password):
            raise InvalidPasswordException(
                "Password should contain at least one digit"
            )
        if not any(char.isupper() for char in password):
            raise InvalidPasswordException(
                "Password should contain at least one uppercase letter"
            )

    async def on_after_register(
        self, user: User, request: Request | None = None
    ):
        if user.is_verified:
            print(
                f"User {user.id} registered as verified; skipping verification email."
            )
            return
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "aud": self.verification_token_audience,
        }
        token = generate_jwt(
            token_data,
            self.verification_token_secret,
            self.verification_token_lifetime_seconds,
        )
        print(f"User {user.id} has registered. Verification token: {token}")
        await send_verification_email(user, token)

    async def on_after_update(
        self,
        user: User,
        update_dict: dict[str, Any],
        request: Request | None = None,
    ) -> None:
        if "email" in update_dict:
            token_data = {
                "sub": str(user.id),
                "email": user.email,
                "aud": self.verification_token_audience,
            }
            token = generate_jwt(
                token_data,
                self.verification_token_secret,
                self.verification_token_lifetime_seconds,
            )
            print(
                f"User {user.id} has updated their email to {user.email}. Verification token: {token}"
            )
            await send_updated_email_verification_email(user, token)
        if "password" in update_dict:
            print(f"User {user.id} has updated their password.")
            await send_password_change_notification_email(user)

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        print(
            f"User {user.id} has forgot their password. Reset token: {token}"
        )
        await send_reset_password_email(user, token)

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        print(
            f"Verification requested for user {user.id}. Verification token: {token}"
        )
        await send_verification_email(user, token)
