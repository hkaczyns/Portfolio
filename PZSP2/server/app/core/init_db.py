import asyncio
import contextlib

from fastapi_users.exceptions import UserNotExists

from app.auth.users import get_async_session, get_user_db, get_user_manager
from app.core.config import get_settings
from app.core.init_examples import init_examples
from app.schemas.user import UserCreate
from app.models.user import UserRole

settings = get_settings()

get_async_session_context = contextlib.asynccontextmanager(get_async_session)
get_user_db_context = contextlib.asynccontextmanager(get_user_db)
get_user_manager_context = contextlib.asynccontextmanager(get_user_manager)


async def init_db() -> None:
    async with get_async_session_context() as session:
        async with get_user_db_context(session) as user_db:
            async with get_user_manager_context(user_db) as user_manager:
                admin_user = await _get_or_create_user(
                    user_manager,
                    email=settings.FIRST_SUPERUSER_EMAIL,
                    password=settings.FIRST_SUPERUSER_PASSWORD,
                    first_name="TipTap",
                    last_name="Admin",
                    is_superuser=True,
                    role=UserRole.ADMIN,
                    label="Superuser",
                )
                student_user = await _get_or_create_user(
                    user_manager,
                    email=settings.FIRST_NORMAL_USER_EMAIL,
                    password=settings.FIRST_NORMAL_USER_PASSWORD,
                    first_name="TipTap",
                    last_name="User",
                    is_superuser=False,
                    role=UserRole.STUDENT,
                    label="Normal user",
                )
                instructor_user = await _get_or_create_user(
                    user_manager,
                    email=settings.FIRST_INSTRUCTOR_EMAIL,
                    password=settings.FIRST_INSTRUCTOR_PASSWORD,
                    first_name="TipTap",
                    last_name="Instructor",
                    is_superuser=False,
                    role=UserRole.INSTRUCTOR,
                    label="Instructor user",
                )
        if settings.APP_ENV == "test":
            print("Skipping example data initialization in test environment.")
            return
        await init_examples(
            session,
            admin_user=admin_user,
            instructor_user=instructor_user,
            student_user=student_user,
        )


async def _get_or_create_user(
    user_manager,
    *,
    email,
    password,
    first_name,
    last_name,
    is_superuser,
    role,
    label,
):
    try:
        user = await user_manager.get_by_email(email)
    except UserNotExists:
        user_data = UserCreate(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_superuser=is_superuser,
            is_verified=True,
            role=role,
        )
        user = await user_manager.create(user_data, safe=False)
        print(f"{label} created: {user.email}")
    else:
        print(f"{label} already exists.")
    return user


if __name__ == "__main__":
    asyncio.run(init_db())
