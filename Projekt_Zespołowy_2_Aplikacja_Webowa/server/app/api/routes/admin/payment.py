from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_superuser
from app.core.db import get_async_session
from app.models.payment import PaymentMethod
from app.schemas.payment import (
    BillingSummary,
    PaymentAllocationCreate,
    PaymentAllocationRead,
    PaymentAllocationUpdate,
    PaymentCreate,
    PaymentRead,
    PaymentUpdate,
)
from app.services.admin import payments as payment_service

router = APIRouter(
    tags=["admin"],
    dependencies=[Depends(current_superuser)],
)


@router.get("/payments", response_model=list[PaymentRead])
async def list_payments(
    student_id: uuid.UUID | None = None,
    paid_from: datetime | None = None,
    paid_to: datetime | None = None,
    method: PaymentMethod | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    return await payment_service.list_payments(
        session,
        student_id=student_id,
        paid_from=paid_from,
        paid_to=paid_to,
        method=method,
    )


@router.get("/payments/{payment_id}", response_model=PaymentRead)
async def get_payment(
    payment_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    payment = await payment_service.get_payment(session, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found.",
        )
    return payment


@router.get(
    "/students/{student_id}/payments",
    response_model=list[PaymentRead],
)
async def list_student_payments(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    return await payment_service.list_payments(session, student_id=student_id)


@router.post(
    "/students/{student_id}/payments",
    response_model=PaymentRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_payment(
    student_id: uuid.UUID,
    payload: PaymentCreate,
    session: AsyncSession = Depends(get_async_session),
):
    try:
        return await payment_service.create_payment(
            session, student_id=student_id, data=payload
        )
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.patch("/payments/{payment_id}", response_model=PaymentRead)
async def update_payment(
    payment_id: int,
    payload: PaymentUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    payment = await payment_service.get_payment(session, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found.",
        )
    if not payload.model_dump(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided.",
        )
    return await payment_service.update_payment(session, payment, payload)


@router.delete(
    "/payments/{payment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_payment(
    payment_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    payment = await payment_service.get_payment(session, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found.",
        )
    await payment_service.delete_payment(session, payment)


@router.get(
    "/payments/{payment_id}/allocations",
    response_model=list[PaymentAllocationRead],
)
async def list_payment_allocations(
    payment_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    return await payment_service.list_allocations_by_payment(
        session, payment_id
    )


@router.get(
    "/charges/{charge_id}/allocations",
    response_model=list[PaymentAllocationRead],
)
async def list_charge_allocations(
    charge_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    return await payment_service.list_allocations_by_charge(session, charge_id)


@router.post(
    "/payments/{payment_id}/allocations",
    response_model=PaymentAllocationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_payment_allocation(
    payment_id: int,
    payload: PaymentAllocationCreate,
    session: AsyncSession = Depends(get_async_session),
):
    try:
        return await payment_service.create_allocation(
            session, payment_id, payload
        )
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except ValueError as exc:
        status_code = (
            status.HTTP_409_CONFLICT
            if "already exists" in str(exc)
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc


@router.patch(
    "/payments/{payment_id}/allocations/{charge_id}",
    response_model=PaymentAllocationRead,
)
async def update_payment_allocation(
    payment_id: int,
    charge_id: int,
    payload: PaymentAllocationUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    allocation = await payment_service.get_allocation(
        session, payment_id, charge_id
    )
    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allocation not found.",
        )
    return await payment_service.update_allocation(
        session, allocation, payload
    )


@router.delete(
    "/payments/{payment_id}/allocations/{charge_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_payment_allocation(
    payment_id: int,
    charge_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    allocation = await payment_service.get_allocation(
        session, payment_id, charge_id
    )
    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allocation not found.",
        )
    await payment_service.delete_allocation(session, allocation)


@router.get(
    "/students/{student_id}/billing/summary",
    response_model=BillingSummary,
)
async def billing_summary(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    return await payment_service.summarize_student_billing(session, student_id)
