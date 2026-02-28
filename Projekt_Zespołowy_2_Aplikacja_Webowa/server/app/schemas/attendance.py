from __future__ import annotations

from datetime import date, datetime, time
import uuid

from pydantic import BaseModel, Field

from app.models.attendance import AttendanceStatus
from app.models.enrollment import EnrollmentStatus
from app.schemas.base import CamelCaseSchema


class AttendanceRead(CamelCaseSchema, BaseModel):
    id: int
    class_session_id: int
    student_id: uuid.UUID
    status: AttendanceStatus
    marked_by: uuid.UUID | None = None
    marked_at: datetime | None = None
    is_makeup: bool


class AttendanceCreate(CamelCaseSchema, BaseModel):
    class_session_id: int
    student_id: uuid.UUID
    status: AttendanceStatus
    is_makeup: bool = False
    marked_by: uuid.UUID | None = None


class AttendanceUpdate(CamelCaseSchema, BaseModel):
    status: AttendanceStatus | None = None
    is_makeup: bool | None = None
    marked_by: uuid.UUID | None = None


class AttendanceBulkItem(CamelCaseSchema, BaseModel):
    student_id: uuid.UUID
    status: AttendanceStatus
    is_makeup: bool = False


class AttendanceBulkCreate(CamelCaseSchema, BaseModel):
    items: list[AttendanceBulkItem] = Field(default_factory=list)


class AttendanceSelfUpdate(CamelCaseSchema, BaseModel):
    status: AttendanceStatus | None = None
    is_makeup: bool | None = None


class StudentAttendanceItem(CamelCaseSchema, BaseModel):
    attendance_id: int
    class_session_id: int
    class_group_id: int
    class_group_name: str
    date: date
    start_time: time
    end_time: time
    room_id: int | None = None
    status: AttendanceStatus
    is_makeup: bool


class StudentAttendanceSummary(CamelCaseSchema, BaseModel):
    total_count: int
    present_count: int
    absent_count: int
    excused_count: int
    makeup_count: int
    attendance_rate: float | None = None


class SessionAttendanceStudent(CamelCaseSchema, BaseModel):
    student_id: uuid.UUID
    first_name: str
    last_name: str
    enrollment_status: EnrollmentStatus
    attendance_id: int | None = None
    status: AttendanceStatus | None = None
    is_makeup: bool | None = None
