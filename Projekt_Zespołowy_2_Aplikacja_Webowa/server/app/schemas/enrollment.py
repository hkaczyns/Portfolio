from __future__ import annotations

from datetime import datetime
from enum import Enum
import uuid

from pydantic import BaseModel

from app.models.enrollment import EnrollmentStatus
from app.schemas.base import CamelCaseSchema
from app.schemas.class_group import ClassGroupAvailabilityRead


class EnrollmentMode(str, Enum):
    AUTO = "AUTO"


class EnrollmentRead(CamelCaseSchema, BaseModel):
    id: int
    student_id: uuid.UUID
    class_group_id: int
    status: EnrollmentStatus
    joined_at: datetime
    cancelled_at: datetime | None = None


class EnrollmentCreate(CamelCaseSchema, BaseModel):
    student_id: uuid.UUID
    class_group_id: int
    status: EnrollmentStatus | None = None


class EnrollmentUpdate(CamelCaseSchema, BaseModel):
    status: EnrollmentStatus | None = None


class EnrollmentSelfCreate(CamelCaseSchema, BaseModel):
    class_group_id: int
    mode: EnrollmentMode = EnrollmentMode.AUTO


class EnrollmentSelfUpdate(CamelCaseSchema, BaseModel):
    status: EnrollmentStatus | None = None


class EnrollmentWithAvailability(CamelCaseSchema, BaseModel):
    enrollment: EnrollmentRead
    availability: ClassGroupAvailabilityRead
