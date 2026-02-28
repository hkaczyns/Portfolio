from datetime import datetime, timezone

import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.payment import ChargeStatus, ChargeType, PaymentMethod
from app.models.user import UserRole
from tests.admin.helpers import create_admin_and_login, create_verified_user

settings = get_settings()


@pytest.mark.asyncio
async def test_admin_can_manage_payments_and_allocations(
    client: AsyncClient,
) -> None:
    await create_admin_and_login(client)
    student = await create_verified_user(
        email="pay_student@example.com",
        password="Student_Password1",
        first_name="Pay",
        last_name="Student",
        role=UserRole.STUDENT,
    )

    charge_response = await client.post(
        f"{settings.API_V1_STR}/admin/students/{student.id}/charges",
        json={
            "dueDate": "2024-02-01",
            "amountDue": "100.00",
            "type": ChargeType.MONTHLY_FEE.value,
        },
    )
    assert charge_response.status_code == status.HTTP_201_CREATED
    charge = charge_response.json()

    payment_response = await client.post(
        f"{settings.API_V1_STR}/admin/students/{student.id}/payments",
        json={
            "amount": "150.00",
            "paidAt": datetime.now(timezone.utc).isoformat(),
            "paymentMethod": PaymentMethod.CASH.value,
            "notes": "Initial payment",
        },
    )
    assert payment_response.status_code == status.HTTP_201_CREATED
    payment = payment_response.json()

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/payments",
        params={"student_id": str(student.id)},
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) == 1

    get_response = await client.get(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}"
    )
    assert get_response.status_code == status.HTTP_200_OK

    allocation_response = await client.post(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}/allocations",
        json={"chargeId": charge["id"], "amountAllocated": "40.00"},
    )
    assert allocation_response.status_code == status.HTTP_201_CREATED

    charge_after_allocation = await client.get(
        f"{settings.API_V1_STR}/admin/charges/{charge['id']}"
    )
    assert charge_after_allocation.status_code == status.HTTP_200_OK
    assert (
        charge_after_allocation.json()["status"] == ChargeStatus.PARTIAL.value
    )

    update_allocation = await client.patch(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}/allocations/{charge['id']}",
        json={"amountAllocated": "100.00"},
    )
    assert update_allocation.status_code == status.HTTP_200_OK

    charge_after_update = await client.get(
        f"{settings.API_V1_STR}/admin/charges/{charge['id']}"
    )
    assert charge_after_update.status_code == status.HTTP_200_OK
    assert charge_after_update.json()["status"] == ChargeStatus.PAID.value

    list_allocations = await client.get(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}/allocations"
    )
    assert list_allocations.status_code == status.HTTP_200_OK
    assert len(list_allocations.json()) == 1

    delete_allocation = await client.delete(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}/allocations/{charge['id']}"
    )
    assert delete_allocation.status_code == status.HTTP_204_NO_CONTENT

    charge_after_delete = await client.get(
        f"{settings.API_V1_STR}/admin/charges/{charge['id']}"
    )
    assert charge_after_delete.status_code == status.HTTP_200_OK
    assert charge_after_delete.json()["status"] == ChargeStatus.OPEN.value

    patch_payment = await client.patch(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}",
        json={"notes": "Updated"},
    )
    assert patch_payment.status_code == status.HTTP_200_OK
    assert patch_payment.json()["notes"] == "Updated"

    delete_payment = await client.delete(
        f"{settings.API_V1_STR}/admin/payments/{payment['id']}"
    )
    assert delete_payment.status_code == status.HTTP_204_NO_CONTENT
