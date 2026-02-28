from __future__ import annotations

from datetime import datetime
import uuid

from pydantic import BaseModel

from app.schemas.base import CamelCaseSchema


class InstructorSubstitutionCreate(CamelCaseSchema, BaseModel):
    substitute_instructor_id: uuid.UUID
    reason: str | None = None


class InstructorSubstitutionRead(CamelCaseSchema, BaseModel):
    id: int
    class_session_id: int
    original_instructor_id: uuid.UUID
    substitute_instructor_id: uuid.UUID
    reason: str | None = None
    created_at: datetime
    created_by: uuid.UUID | None = None
