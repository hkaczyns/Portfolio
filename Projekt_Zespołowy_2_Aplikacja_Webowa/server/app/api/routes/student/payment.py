from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_student
from app.core.db import get_async_session
from app.models.payment import ChargeStatus, ChargeType
from app.models.user import User
from app.schemas.payment import (
    ChargeRead,
    PaymentRead,
    StudentBillingSummary,
)
from app.services.student import payment as payment_service

router = APIRouter(prefix="/me", tags=["student"])


@router.get("/charges", response_model=list[ChargeRead])
async def list_charges(
    status_filter: ChargeStatus | None = Query(default=None, alias="status"),
    type_filter: ChargeType | None = Query(default=None, alias="type"),
    due_from: date | None = None,
    due_to: date | None = None,
    overdue: bool | None = None,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    return await payment_service.list_student_charges(
        session,
        student_id=user.id,
        status=status_filter,
        charge_type=type_filter,
        due_from=due_from,
        due_to=due_to,
        overdue=overdue,
    )


@router.get("/charges/{charge_id}", response_model=ChargeRead)
async def get_charge(
    charge_id: int,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    charge = await payment_service.get_student_charge(session, charge_id)
    if not charge or charge.student_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charge not found.",
        )
    return charge


@router.get("/payments", response_model=list[PaymentRead])
async def list_payments(
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    return await payment_service.list_student_payments(
        session, student_id=user.id
    )


@router.get("/payments/{payment_id}", response_model=PaymentRead)
async def get_payment(
    payment_id: int,
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    payment = await payment_service.get_student_payment(session, payment_id)
    if not payment or payment.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found.",
        )
    return payment


@router.get("/billing/summary", response_model=StudentBillingSummary)
async def billing_summary(
    user: User = Depends(current_student),
    session: AsyncSession = Depends(get_async_session),
):
    full_name = f"{user.first_name} {user.last_name}"
    return await payment_service.summarize_student_billing(
        session, student_id=user.id, full_name=full_name
    )
