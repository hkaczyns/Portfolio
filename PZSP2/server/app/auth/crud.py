import contextlib

from app.auth.users import get_async_session, get_user_db, get_user_manager
from app.schemas.user import UserCreate
from app.models.user import User
from fastapi_users.exceptions import UserAlreadyExists

get_async_session_context = contextlib.asynccontextmanager(get_async_session)
get_user_db_context = contextlib.asynccontextmanager(get_user_db)
get_user_manager_context = contextlib.asynccontextmanager(get_user_manager)


async def create_user(user_data: UserCreate) -> User:
    try:
        async with get_async_session_context() as session:
            async with get_user_db_context(session) as user_db:
                async with get_user_manager_context(user_db) as user_manager:
                    user = await user_manager.create(user_data)
                    print(f"User created {user}")
                    return user
    except UserAlreadyExists:
        print(f"User {user_data.email} already exists")
        raise
