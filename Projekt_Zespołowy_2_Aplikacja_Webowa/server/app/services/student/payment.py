from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Charge, ChargeStatus, ChargeType, Payment
from app.models.payment import PaymentAllocation


async def list_student_charges(
    session: AsyncSession,
    student_id: uuid.UUID,
    status: ChargeStatus | None = None,
    charge_type: ChargeType | None = None,
    due_from: date | None = None,
    due_to: date | None = None,
    overdue: bool | None = None,
) -> list[Charge]:
    query = select(Charge).where(Charge.student_id == student_id)
    if status is not None:
        query = query.where(Charge.status == status)
    if charge_type is not None:
        query = query.where(Charge.type == charge_type)
    if due_from is not None:
        query = query.where(Charge.due_date >= due_from)
    if due_to is not None:
        query = query.where(Charge.due_date <= due_to)
    if overdue is not None:
        today = date.today()
        overdue_clause = (Charge.due_date < today) & Charge.status.in_(
            [ChargeStatus.OPEN, ChargeStatus.PARTIAL]
        )
        query = query.where(overdue_clause if overdue else ~overdue_clause)
    query = query.order_by(Charge.due_date.desc(), Charge.id.desc())
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_student_charge(
    session: AsyncSession, charge_id: int
) -> Charge | None:
    return await session.get(Charge, charge_id)


async def list_student_payments(
    session: AsyncSession,
    student_id: uuid.UUID,
) -> list[Payment]:
    result = await session.execute(
        select(Payment)
        .where(Payment.user_id == student_id)
        .order_by(Payment.paid_at.desc(), Payment.id.desc())
    )
    return list(result.scalars().all())


async def get_student_payment(
    session: AsyncSession, payment_id: int
) -> Payment | None:
    return await session.get(Payment, payment_id)


async def _allocation_totals(
    session: AsyncSession, charge_ids: list[int]
) -> dict[int, Decimal]:
    if not charge_ids:
        return {}
    result = await session.execute(
        select(
            PaymentAllocation.charge_id,
            func.coalesce(
                func.sum(PaymentAllocation.amount_allocated), Decimal("0")
            ).label("allocated"),
        )
        .where(PaymentAllocation.charge_id.in_(charge_ids))
        .group_by(PaymentAllocation.charge_id)
    )
    return {row.charge_id: row.allocated for row in result.all()}


async def summarize_student_billing(
    session: AsyncSession,
    student_id: uuid.UUID,
    full_name: str | None = None,
) -> dict:
    result = await session.execute(
        select(Charge)
        .where(
            Charge.student_id == student_id,
            Charge.status.in_([ChargeStatus.OPEN, ChargeStatus.PARTIAL]),
        )
        .order_by(Charge.due_date)
    )
    open_charges = list(result.scalars().all())
    charge_ids = [charge.id for charge in open_charges]
    allocated_map = await _allocation_totals(session, charge_ids)
    today = date.today()
    month_start = today.replace(day=1)
    next_month = (month_start + timedelta(days=32)).replace(day=1)
    month_end = next_month - timedelta(days=1)
    current_month_due = Decimal("0")
    total_overdue = Decimal("0")
    for charge in open_charges:
        allocated = allocated_map.get(charge.id, Decimal("0"))
        remaining = charge.amount_due - allocated
        if remaining < Decimal("0"):
            remaining = Decimal("0")
        if month_start <= charge.due_date <= month_end:
            current_month_due += remaining
        if charge.due_date < today:
            total_overdue += remaining
    last_payment_result = await session.execute(
        select(func.max(Payment.paid_at)).where(Payment.user_id == student_id)
    )
    last_payment_at = last_payment_result.scalar_one()
    transfer_title = None
    if full_name:
        transfer_title = f"{full_name} - {today:%Y-%m}"
    return {
        "current_month_due": current_month_due,
        "total_overdue": total_overdue,
        "open_charges": open_charges,
        "last_payment_at": last_payment_at,
        "recommended_transfer_title": transfer_title,
    }
