import uuid

from fastapi_users import schemas
from pydantic import BaseModel, Field

from app.models.user import UserRole
from app.schemas.attendance import StudentAttendanceSummary
from app.schemas.base import CamelCaseSchema
from app.schemas.class_group import ClassGroupRead
from app.schemas.enrollment import EnrollmentRead


class UserRead(CamelCaseSchema, schemas.BaseUser[uuid.UUID]):
    first_name: str = Field(..., max_length=64)
    last_name: str = Field(..., max_length=128)
    role: UserRole


class UserCreate(CamelCaseSchema, schemas.BaseUserCreate):
    first_name: str = Field(..., max_length=64)
    last_name: str = Field(..., max_length=128)
    role: UserRole = Field(default=UserRole.STUDENT)


class UserUpdate(CamelCaseSchema, schemas.BaseUserUpdate):
    first_name: str | None = Field(default=None, max_length=64)
    last_name: str | None = Field(default=None, max_length=128)
    role: UserRole | None = None


class UserUpdateSecure(UserUpdate):
    current_password: str | None = None


class AdminUserActivityStats(CamelCaseSchema, BaseModel):
    enrollments_total: int | None = None
    enrollments_active: int | None = None
    attendance_summary: StudentAttendanceSummary | None = None
    class_groups_total: int | None = None
    class_sessions_total: int | None = None


class AdminUserDetail(UserRead):
    class_groups: list[ClassGroupRead] = Field(default_factory=list)
    enrollments: list[EnrollmentRead] = Field(default_factory=list)
    activity_stats: AdminUserActivityStats | None = None
