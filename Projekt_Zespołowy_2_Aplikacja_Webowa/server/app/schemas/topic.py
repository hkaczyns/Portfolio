from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.base import CamelCaseSchema


class TopicBase(CamelCaseSchema, BaseModel):
    name: str = Field(..., max_length=64)
    description: str | None = None


class TopicCreate(TopicBase):
    pass


class TopicUpdate(CamelCaseSchema, BaseModel):
    name: str | None = Field(default=None, max_length=64)
    description: str | None = None


class TopicRead(TopicBase):
    id: int


class TopicMap(CamelCaseSchema, BaseModel):
    id: int
    name: str = Field(..., max_length=64)
