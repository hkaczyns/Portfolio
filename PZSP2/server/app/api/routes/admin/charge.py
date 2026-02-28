from datetime import date
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_superuser
from app.core.db import get_async_session
from app.models.payment import ChargeStatus, ChargeType
from app.models.user import User
from app.schemas.payment import ChargeCreate, ChargeRead, ChargeUpdate
from app.services.admin import charges as charge_service

router = APIRouter(
    tags=["admin"],
    dependencies=[Depends(current_superuser)],
)


@router.get("/charges", response_model=list[ChargeRead])
async def list_charges(
    student_id: uuid.UUID | None = None,
    status_filter: ChargeStatus | None = Query(default=None, alias="status"),
    type_filter: ChargeType | None = Query(default=None, alias="type"),
    due_from: date | None = None,
    due_to: date | None = None,
    overdue: bool | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    return await charge_service.list_charges(
        session,
        student_id=student_id,
        status=status_filter,
        charge_type=type_filter,
        due_from=due_from,
        due_to=due_to,
        overdue=overdue,
    )


@router.get("/charges/{charge_id}", response_model=ChargeRead)
async def get_charge(
    charge_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    charge = await charge_service.get_charge(session, charge_id)
    if not charge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charge not found.",
        )
    return charge


@router.get("/students/{student_id}/charges", response_model=list[ChargeRead])
async def list_student_charges(
    student_id: uuid.UUID,
    status_filter: ChargeStatus | None = Query(default=None, alias="status"),
    type_filter: ChargeType | None = Query(default=None, alias="type"),
    due_from: date | None = None,
    due_to: date | None = None,
    overdue: bool | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    return await charge_service.list_charges(
        session,
        student_id=student_id,
        status=status_filter,
        charge_type=type_filter,
        due_from=due_from,
        due_to=due_to,
        overdue=overdue,
    )


@router.post(
    "/students/{student_id}/charges",
    response_model=ChargeRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_charge(
    student_id: uuid.UUID,
    payload: ChargeCreate,
    user: User = Depends(current_superuser),
    session: AsyncSession = Depends(get_async_session),
):
    try:
        return await charge_service.create_charge(
            session,
            student_id=student_id,
            data=payload,
            created_by=user.id,
        )
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.patch("/charges/{charge_id}", response_model=ChargeRead)
async def update_charge(
    charge_id: int,
    payload: ChargeUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    charge = await charge_service.get_charge(session, charge_id)
    if not charge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charge not found.",
        )
    if not payload.model_dump(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided.",
        )
    try:
        return await charge_service.update_charge(session, charge, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.post("/charges/{charge_id}/cancel", response_model=ChargeRead)
async def cancel_charge(
    charge_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    charge = await charge_service.get_charge(session, charge_id)
    if not charge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charge not found.",
        )
    return await charge_service.cancel_charge(session, charge)
