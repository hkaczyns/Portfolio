from fastapi import Depends, HTTPException, status

from app.auth.users import current_user
from app.models.user import User, UserRole


async def current_student(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions.",
        )
    return user


async def current_instructor_or_admin(
    user: User = Depends(current_user),
) -> User:
    if user.role not in {UserRole.INSTRUCTOR, UserRole.ADMIN}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions.",
        )
    return user
