from datetime import date, timedelta

import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import get_settings
from app.models.payment import ChargeStatus, ChargeType
from app.models.user import UserRole
from tests.admin.helpers import create_admin_and_login, create_verified_user

settings = get_settings()


@pytest.mark.asyncio
async def test_admin_can_manage_charges(client: AsyncClient) -> None:
    await create_admin_and_login(client)
    student = await create_verified_user(
        email="charge_student@example.com",
        password="Student_Password1",
        first_name="Charge",
        last_name="Student",
        role=UserRole.STUDENT,
    )
    overdue_date = date.today() - timedelta(days=40)
    future_date = date.today() + timedelta(days=10)

    create_overdue = await client.post(
        f"{settings.API_V1_STR}/admin/students/{student.id}/charges",
        json={
            "dueDate": overdue_date.isoformat(),
            "amountDue": "120.00",
            "type": ChargeType.MONTHLY_FEE.value,
        },
    )
    assert create_overdue.status_code == status.HTTP_201_CREATED
    overdue_charge = create_overdue.json()

    create_future = await client.post(
        f"{settings.API_V1_STR}/admin/students/{student.id}/charges",
        json={
            "dueDate": future_date.isoformat(),
            "amountDue": "80.00",
            "type": ChargeType.ADDITIONAL_CLASSES.value,
        },
    )
    assert create_future.status_code == status.HTTP_201_CREATED
    future_charge = create_future.json()

    list_response = await client.get(
        f"{settings.API_V1_STR}/admin/charges",
        params={"student_id": str(student.id)},
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) == 2

    list_student_response = await client.get(
        f"{settings.API_V1_STR}/admin/students/{student.id}/charges"
    )
    assert list_student_response.status_code == status.HTTP_200_OK
    assert len(list_student_response.json()) == 2

    overdue_response = await client.get(
        f"{settings.API_V1_STR}/admin/charges", params={"overdue": "true"}
    )
    assert overdue_response.status_code == status.HTTP_200_OK
    assert any(
        item["id"] == overdue_charge["id"] for item in overdue_response.json()
    )

    get_response = await client.get(
        f"{settings.API_V1_STR}/admin/charges/{future_charge['id']}"
    )
    assert get_response.status_code == status.HTTP_200_OK

    patch_response = await client.patch(
        f"{settings.API_V1_STR}/admin/charges/{future_charge['id']}",
        json={"status": ChargeStatus.CANCELLED.value},
    )
    assert patch_response.status_code == status.HTTP_200_OK
    assert patch_response.json()["status"] == ChargeStatus.CANCELLED.value
