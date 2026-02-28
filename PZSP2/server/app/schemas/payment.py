from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
import uuid

from pydantic import BaseModel, Field

from app.models.payment import ChargeStatus, ChargeType, PaymentMethod
from app.schemas.base import CamelCaseSchema


class ChargeRead(CamelCaseSchema, BaseModel):
    id: int
    student_id: uuid.UUID
    due_date: date
    amount_due: Decimal
    type: ChargeType
    status: ChargeStatus
    created_by: uuid.UUID | None = None
    created_at: datetime


class ChargeCreate(CamelCaseSchema, BaseModel):
    due_date: date
    amount_due: Decimal = Field(..., gt=0)
    type: ChargeType


class ChargeUpdate(CamelCaseSchema, BaseModel):
    due_date: date | None = None
    amount_due: Decimal | None = Field(default=None, gt=0)
    type: ChargeType | None = None
    status: ChargeStatus | None = None


class PaymentRead(CamelCaseSchema, BaseModel):
    id: int
    user_id: uuid.UUID
    amount: Decimal
    paid_at: datetime
    payment_method: PaymentMethod
    notes: str | None = None


class PaymentCreate(CamelCaseSchema, BaseModel):
    amount: Decimal = Field(..., gt=0)
    paid_at: datetime
    payment_method: PaymentMethod
    notes: str | None = None


class PaymentUpdate(CamelCaseSchema, BaseModel):
    amount: Decimal | None = Field(default=None, gt=0)
    paid_at: datetime | None = None
    payment_method: PaymentMethod | None = None
    notes: str | None = None


class PaymentAllocationRead(CamelCaseSchema, BaseModel):
    payment_id: int
    charge_id: int
    amount_allocated: Decimal


class PaymentAllocationCreate(CamelCaseSchema, BaseModel):
    charge_id: int
    amount_allocated: Decimal = Field(..., gt=0)


class PaymentAllocationUpdate(CamelCaseSchema, BaseModel):
    amount_allocated: Decimal = Field(..., gt=0)


class BillingSummary(CamelCaseSchema, BaseModel):
    total_open: Decimal
    total_overdue: Decimal
    next_due_date: date | None = None
    open_charges: list[ChargeRead] = Field(default_factory=list)


class StudentBillingSummary(CamelCaseSchema, BaseModel):
    current_month_due: Decimal
    total_overdue: Decimal
    open_charges: list[ChargeRead] = Field(default_factory=list)
    last_payment_at: datetime | None = None
    recommended_transfer_title: str | None = None
