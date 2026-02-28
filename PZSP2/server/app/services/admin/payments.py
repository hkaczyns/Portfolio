from __future__ import annotations

from datetime import datetime
from decimal import Decimal
import uuid

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import (
    Charge,
    ChargeStatus,
    Payment,
    PaymentAllocation,
    PaymentMethod,
)
from app.models.user import User
from app.schemas.payment import (
    PaymentAllocationCreate,
    PaymentAllocationUpdate,
    PaymentCreate,
    PaymentUpdate,
)
from app.services.admin import charges as charge_service


async def list_payments(
    session: AsyncSession,
    student_id: uuid.UUID | None = None,
    paid_from: datetime | None = None,
    paid_to: datetime | None = None,
    method: PaymentMethod | None = None,
) -> list[Payment]:
    query = select(Payment)
    if student_id is not None:
        query = query.where(Payment.user_id == student_id)
    if paid_from is not None:
        query = query.where(Payment.paid_at >= paid_from)
    if paid_to is not None:
        query = query.where(Payment.paid_at <= paid_to)
    if method is not None:
        query = query.where(Payment.payment_method == method)
    query = query.order_by(Payment.paid_at.desc(), Payment.id.desc())
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_payment(
    session: AsyncSession, payment_id: int
) -> Payment | None:
    return await session.get(Payment, payment_id)


async def create_payment(
    session: AsyncSession,
    student_id: uuid.UUID,
    data: PaymentCreate,
) -> Payment:
    student = await session.get(User, student_id)
    if not student:
        raise LookupError("Student not found.")
    payment = Payment(user_id=student_id, **data.model_dump())
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment


async def update_payment(
    session: AsyncSession, payment: Payment, data: PaymentUpdate
) -> Payment:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(payment, key, value)
    await session.commit()
    await session.refresh(payment)
    return payment


async def delete_payment(session: AsyncSession, payment: Payment) -> None:
    result = await session.execute(
        select(PaymentAllocation).where(
            PaymentAllocation.payment_id == payment.id
        )
    )
    allocations = list(result.scalars().all())
    charge_ids = {allocation.charge_id for allocation in allocations}
    for allocation in allocations:
        await session.delete(allocation)
    await session.delete(payment)
    await session.commit()
    for charge_id in charge_ids:
        charge = await session.get(Charge, charge_id)
        if charge:
            await charge_service.recalculate_charge_status(session, charge)


async def list_allocations_by_payment(
    session: AsyncSession, payment_id: int
) -> list[PaymentAllocation]:
    result = await session.execute(
        select(PaymentAllocation)
        .where(PaymentAllocation.payment_id == payment_id)
        .order_by(PaymentAllocation.charge_id)
    )
    return list(result.scalars().all())


async def list_allocations_by_charge(
    session: AsyncSession, charge_id: int
) -> list[PaymentAllocation]:
    result = await session.execute(
        select(PaymentAllocation)
        .where(PaymentAllocation.charge_id == charge_id)
        .order_by(PaymentAllocation.payment_id)
    )
    return list(result.scalars().all())


async def get_allocation(
    session: AsyncSession, payment_id: int, charge_id: int
) -> PaymentAllocation | None:
    result = await session.execute(
        select(PaymentAllocation).where(
            PaymentAllocation.payment_id == payment_id,
            PaymentAllocation.charge_id == charge_id,
        )
    )
    return result.scalar_one_or_none()


async def create_allocation(
    session: AsyncSession,
    payment_id: int,
    data: PaymentAllocationCreate,
) -> PaymentAllocation:
    payment = await session.get(Payment, payment_id)
    if not payment:
        raise LookupError("Payment not found.")
    charge = await session.get(Charge, data.charge_id)
    if not charge:
        raise LookupError("Charge not found.")
    if charge.status == ChargeStatus.CANCELLED:
        raise ValueError("Charge is cancelled.")
    if charge.student_id != payment.user_id:
        raise ValueError("Charge does not belong to payment user.")
    allocation = PaymentAllocation(
        payment_id=payment.id,
        charge_id=charge.id,
        amount_allocated=data.amount_allocated,
    )
    session.add(allocation)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise ValueError("Allocation already exists.") from exc
    await session.refresh(allocation)
    await charge_service.recalculate_charge_status(session, charge)
    return allocation


async def update_allocation(
    session: AsyncSession,
    allocation: PaymentAllocation,
    data: PaymentAllocationUpdate,
) -> PaymentAllocation:
    allocation.amount_allocated = data.amount_allocated
    await session.commit()
    await session.refresh(allocation)
    charge = await session.get(Charge, allocation.charge_id)
    if charge:
        await charge_service.recalculate_charge_status(session, charge)
    return allocation


async def delete_allocation(
    session: AsyncSession, allocation: PaymentAllocation
) -> None:
    charge_id = allocation.charge_id
    await session.delete(allocation)
    await session.commit()
    charge = await session.get(Charge, charge_id)
    if charge:
        await charge_service.recalculate_charge_status(session, charge)


async def summarize_student_billing(
    session: AsyncSession, student_id: uuid.UUID
) -> dict:
    open_charges = await session.execute(
        select(Charge)
        .where(
            Charge.student_id == student_id,
            Charge.status.in_([ChargeStatus.OPEN, ChargeStatus.PARTIAL]),
        )
        .order_by(Charge.due_date)
    )
    open_charges_list = list(open_charges.scalars().all())
    if not open_charges_list:
        return {
            "total_open": Decimal("0"),
            "total_overdue": Decimal("0"),
            "next_due_date": None,
            "open_charges": [],
        }
    charge_ids = [charge.id for charge in open_charges_list]
    allocation_result = await session.execute(
        select(
            PaymentAllocation.charge_id,
            func.coalesce(
                func.sum(PaymentAllocation.amount_allocated), Decimal("0")
            ).label("allocated"),
        )
        .where(PaymentAllocation.charge_id.in_(charge_ids))
        .group_by(PaymentAllocation.charge_id)
    )
    allocated_map = {
        row.charge_id: row.allocated for row in allocation_result.all()
    }
    today = datetime.now().date()
    total_open = Decimal("0")
    total_overdue = Decimal("0")
    for charge in open_charges_list:
        allocated = allocated_map.get(charge.id, Decimal("0"))
        remaining = charge.amount_due - allocated
        if remaining < Decimal("0"):
            remaining = Decimal("0")
        total_open += remaining
        if charge.due_date < today:
            total_overdue += remaining
    return {
        "total_open": total_open,
        "total_overdue": total_overdue,
        "next_due_date": open_charges_list[0].due_date,
        "open_charges": open_charges_list,
    }
