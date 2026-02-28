from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.base import CamelCaseSchema


class SkillLevelBase(CamelCaseSchema, BaseModel):
    name: str = Field(..., max_length=64)
    description: str | None = None


class SkillLevelCreate(SkillLevelBase):
    pass


class SkillLevelUpdate(CamelCaseSchema, BaseModel):
    name: str | None = Field(default=None, max_length=64)
    description: str | None = None


class SkillLevelRead(SkillLevelBase):
    id: int


class SkillLevelMap(CamelCaseSchema, BaseModel):
    id: int
    name: str = Field(..., max_length=64)
