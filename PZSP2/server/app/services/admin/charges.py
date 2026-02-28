from __future__ import annotations

from datetime import date
from decimal import Decimal
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.email.send_email import send_new_charge_email
from app.models.payment import (
    Charge,
    ChargeStatus,
    ChargeType,
    PaymentAllocation,
)
from app.models.user import User
from app.schemas.payment import ChargeCreate, ChargeUpdate


async def list_charges(
    session: AsyncSession,
    student_id: uuid.UUID | None = None,
    status: ChargeStatus | None = None,
    charge_type: ChargeType | None = None,
    due_from: date | None = None,
    due_to: date | None = None,
    overdue: bool | None = None,
) -> list[Charge]:
    query = select(Charge)
    if student_id is not None:
        query = query.where(Charge.student_id == student_id)
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


async def get_charge(session: AsyncSession, charge_id: int) -> Charge | None:
    return await session.get(Charge, charge_id)


async def create_charge(
    session: AsyncSession,
    student_id: uuid.UUID,
    data: ChargeCreate,
    created_by: uuid.UUID | None,
) -> Charge:
    student = await session.get(User, student_id)
    if not student:
        raise LookupError("Student not found.")
    charge = Charge(
        student_id=student_id,
        due_date=data.due_date,
        amount_due=data.amount_due,
        type=data.type,
        created_by=created_by,
    )
    session.add(charge)
    await session.commit()
    await session.refresh(charge)
    await send_new_charge_email(student, charge)
    return charge


async def update_charge(
    session: AsyncSession, charge: Charge, data: ChargeUpdate
) -> Charge:
    updates = data.model_dump(exclude_unset=True)
    new_status = updates.get("status")
    if new_status is not None and new_status != ChargeStatus.CANCELLED:
        raise ValueError("Only cancellation is allowed.")
    for key, value in updates.items():
        setattr(charge, key, value)
    await session.commit()
    await session.refresh(charge)
    if "amount_due" in updates and charge.status != ChargeStatus.CANCELLED:
        await recalculate_charge_status(session, charge)
    return charge


async def cancel_charge(session: AsyncSession, charge: Charge) -> Charge:
    charge.status = ChargeStatus.CANCELLED
    await session.commit()
    await session.refresh(charge)
    return charge


async def recalculate_charge_status(
    session: AsyncSession, charge: Charge
) -> Charge:
    if charge.status == ChargeStatus.CANCELLED:
        return charge
    result = await session.execute(
        select(
            func.coalesce(
                func.sum(PaymentAllocation.amount_allocated),
                Decimal("0"),
            )
        ).where(PaymentAllocation.charge_id == charge.id)
    )
    total_allocated = result.scalar_one()
    if total_allocated <= Decimal("0"):
        new_status = ChargeStatus.OPEN
    elif total_allocated >= charge.amount_due:
        new_status = ChargeStatus.PAID
    else:
        new_status = ChargeStatus.PARTIAL
    if charge.status != new_status:
        charge.status = new_status
        await session.commit()
        await session.refresh(charge)
    return charge
