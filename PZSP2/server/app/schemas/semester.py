from __future__ import annotations

from datetime import date, datetime
import uuid

from pydantic import BaseModel, Field

from app.schemas.base import CamelCaseSchema


class SemesterBase(CamelCaseSchema, BaseModel):
    name: str = Field(..., max_length=128)
    start_date: date
    end_date: date
    is_active: bool = True


class SemesterCreate(SemesterBase):
    pass


class SemesterUpdate(CamelCaseSchema, BaseModel):
    name: str | None = Field(default=None, max_length=128)
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None


class SemesterRead(SemesterBase):
    id: int
    created_at: datetime
    created_by: uuid.UUID | None = None
    updated_at: datetime | None = None


class SemesterMap(CamelCaseSchema, BaseModel):
    id: int
    name: str = Field(..., max_length=128)
