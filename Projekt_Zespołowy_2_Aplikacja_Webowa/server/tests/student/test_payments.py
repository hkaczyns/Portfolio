from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.payment import ChargeType, PaymentMethod
from app.models.user import UserRole
from tests.admin.helpers import (
    create_admin_and_login,
    create_verified_user,
    login,
)

settings = get_settings()


@pytest.mark.asyncio
async def test_student_can_view_charges_payments_and_summary(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    student = await create_verified_user(
        email="student_pay@example.com",
        password="Student_Password1",
        first_name="Pay",
        last_name="Student",
        role=UserRole.STUDENT,
    )
    other_student = await create_verified_user(
        email="student_other@example.com",
        password="Student_Password1",
        first_name="Other",
        last_name="Student",
        role=UserRole.STUDENT,
    )

    today = date.today()
    current_charge_response = await client.post(
        f"{settings.API_V1_STR}/admin/students/{student.id}/charges",
        json={
            "dueDate": today.isoformat(),
            "amountDue": "100.00",
            "type": ChargeType.MONTHLY_FEE.value,
        },
    )
    assert current_charge_response.status_code == status.HTTP_201_CREATED
    current_charge = current_charge_response.json()

    overdue_date = today - timedelta(days=40)
    overdue_charge_response = await client.post(
        f"{settings.API_V1_STR}/admin/students/{student.id}/charges",
        json={
            "dueDate": overdue_date.isoformat(),
            "amountDue": "50.00",
            "type": ChargeType.ADDITIONAL_CLASSES.value,
        },
    )
    assert overdue_charge_response.status_code == status.HTTP_201_CREATED

    other_charge_response = await client.post(
        f"{settings.API_V1_STR}/admin/students/{other_student.id}/charges",
        json={
            "dueDate": today.isoformat(),
            "amountDue": "70.00",
            "type": ChargeType.MONTHLY_FEE.value,
        },
    )
    assert other_charge_response.status_code == status.HTTP_201_CREATED
    other_charge = other_charge_response.json()

    payment_response = await client.post(
        f"{settings.API_V1_STR}/admin/students/{student.id}/payments",
        json={
            "amount": "150.00",
            "paidAt": datetime.now(timezone.utc).isoformat(),
            "paymentMethod": PaymentMethod.TRANSFER.value,
        },
    )
    assert payment_response.status_code == status.HTTP_201_CREATED
    payment = payment_response.json()

    allocation_response = await client.post(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}/allocations",
        json={
            "chargeId": current_charge["id"],
            "amountAllocated": "40.00",
        },
    )
    assert allocation_response.status_code == status.HTTP_201_CREATED

    await login(client, "student_pay@example.com", "Student_Password1")

    list_charges = await client.get(f"{settings.API_V1_STR}/me/charges")
    assert list_charges.status_code == status.HTTP_200_OK
    assert len(list_charges.json()) == 2

    get_charge = await client.get(
        f"{settings.API_V1_STR}/me/charges/{current_charge['id']}"
    )
    assert get_charge.status_code == status.HTTP_200_OK

    get_other_charge = await client.get(
        f"{settings.API_V1_STR}/me/charges/{other_charge['id']}"
    )
    assert get_other_charge.status_code == status.HTTP_404_NOT_FOUND

    list_payments = await client.get(f"{settings.API_V1_STR}/me/payments")
    assert list_payments.status_code == status.HTTP_200_OK
    assert len(list_payments.json()) == 1

    get_payment = await client.get(
        f"{settings.API_V1_STR}/me/payments/{payment['id']}"
    )
    assert get_payment.status_code == status.HTTP_200_OK

    summary_response = await client.get(
        f"{settings.API_V1_STR}/me/billing/summary"
    )
    assert summary_response.status_code == status.HTTP_200_OK
    summary = summary_response.json()
    assert Decimal(summary["currentMonthDue"]) == Decimal("60.00")
    assert Decimal(summary["totalOverdue"]) == Decimal("50.00")
    assert summary["openCharges"]
    assert summary["lastPaymentAt"] is not None
    assert summary["recommendedTransferTitle"].startswith("Pay Student")
