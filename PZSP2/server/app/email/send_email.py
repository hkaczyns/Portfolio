from pathlib import Path
from typing import Any, cast
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import BaseModel, NameEmail
import logging

from app.models.enrollment import EnrollmentStatus
from app.models.payment import Charge
from app.models.schedule import ClassGroup
from app.models.user import User
from app.core.config import get_settings
from app.utils.email_formatting import (
    _format_charge_type,
    _format_class_group_schedule,
)


class EmailSchema(BaseModel):
    subject: str
    email: list[NameEmail]
    body: dict[str, Any]


async def send_with_template(
    email: EmailSchema,
    template_path: str,
    attachments: list | None = None,
) -> None:
    settings = get_settings()
    if (
        not settings.SMTP_HOST
        or not settings.SMTP_USER
        or not settings.SMTP_PASSWORD
        or not settings.EMAILS_FROM_EMAIL
    ):
        raise EnvironmentError("SMTP settings are not properly configured.")
    if not attachments:
        attachments = []

    conf = ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER,
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_PORT=settings.SMTP_PORT,
        MAIL_FROM=settings.EMAILS_FROM_EMAIL,
        MAIL_FROM_NAME=settings.EMAILS_FROM_NAME,
        MAIL_SERVER=settings.SMTP_HOST,
        MAIL_STARTTLS=settings.SMTP_TLS,
        MAIL_SSL_TLS=settings.SMTP_SSL,
        TEMPLATE_FOLDER=Path(__file__).parent / "templates",
    )

    recipients = [item.email for item in email.email]
    allowed_recipients = [
        recipient
        for recipient in recipients
        if not _is_blocked_domain(recipient)
    ]
    if not allowed_recipients:
        logging.info(
            "Email sending skipped for blocked domain.",
            extra={"email": email.model_dump(), "blocked_domain": "tiptap.pl"},
        )
        return

    message = MessageSchema(
        subject=email.subject,
        recipients=cast(list[NameEmail], allowed_recipients),
        subtype=MessageType.html,
        template_body=email.body,
        attachments=attachments,
    )
    fm = FastMail(conf)
    if settings.APP_ENV == "production" or (
        settings.APP_ENV == "development" and settings.SEND_EMAILS
    ):
        await fm.send_message(message, template_name=template_path)
    else:
        logging.info(
            "Email sending is disabled in the current environment.",
            extra={"email": email.model_dump()},
        )


def _is_blocked_domain(address: str) -> bool:
    domain = address.rsplit("@", 1)[-1].lower()
    return domain == "tiptap.pl"


async def send_verification_email(user: User, token: str) -> None:
    settings = get_settings()
    user_full_name = f"{user.first_name} {user.last_name}".strip()
    link = f"{settings.FRONTEND_BASE_URL}/verification/{token}"
    await send_with_template(
        EmailSchema(
            subject="Witamy w TipTap! Potwierdź swój adres e-mail",
            email=[NameEmail(email=user.email, name=user_full_name)],
            body={
                "first_name": user.first_name,
                "verification_link": link,
            },
        ),
        "verify_dark.html",
    )


async def send_updated_email_verification_email(
    user: User, token: str
) -> None:
    settings = get_settings()
    user_full_name = f"{user.first_name} {user.last_name}".strip()
    link = f"{settings.FRONTEND_BASE_URL}/verification/{token}"
    await send_with_template(
        EmailSchema(
            subject="TipTap - Potwierdź swój nowy adres e-mail",
            email=[NameEmail(email=user.email, name=user_full_name)],
            body={
                "first_name": user.first_name,
                "verification_link": link,
            },
        ),
        "verify_updated_email_dark.html",
    )


async def send_password_change_notification_email(user: User) -> None:
    user_full_name = f"{user.first_name} {user.last_name}".strip()
    await send_with_template(
        EmailSchema(
            subject="TipTap - Powiadomienie o zmianie hasła",
            email=[NameEmail(email=user.email, name=user_full_name)],
            body={
                "first_name": user.first_name,
            },
        ),
        "password_change_notification_dark.html",
    )


async def send_reset_password_email(user: User, token: str) -> None:
    settings = get_settings()
    user_full_name = f"{user.first_name} {user.last_name}".strip()
    link = f"{settings.FRONTEND_BASE_URL}/reset-password/{token}"
    await send_with_template(
        EmailSchema(
            subject="TipTap - Resetowanie hasła",
            email=[NameEmail(email=user.email, name=user_full_name)],
            body={
                "first_name": user.first_name,
                "reset_password_link": link,
            },
        ),
        "reset_password_dark.html",
    )


async def send_enrollment_confirmation_email(
    user: User, class_group: ClassGroup, status: EnrollmentStatus
) -> None:
    settings = get_settings()
    user_full_name = f"{user.first_name} {user.last_name}".strip()
    schedule_link = f"{settings.FRONTEND_BASE_URL}/my-schedule"
    status_labels = {
        EnrollmentStatus.ACTIVE: "Aktywny",
        EnrollmentStatus.WAITLISTED: "Lista rezerwowa",
        EnrollmentStatus.CANCELLED: "Anulowany",
        EnrollmentStatus.COMPLETED: "Zakończony",
    }
    status_messages = {
        EnrollmentStatus.ACTIVE: "Do zobaczenia na zajęciach!",
        EnrollmentStatus.WAITLISTED: (
            "Jesteś na liście rezerwowej. Damy znać, gdy zwolni się miejsce."
        ),
    }
    await send_with_template(
        EmailSchema(
            subject="TipTap - Potwierdzenie zapisu na zajęcia",
            email=[NameEmail(email=user.email, name=user_full_name)],
            body={
                "first_name": user.first_name,
                "class_group_name": class_group.name,
                "class_group_schedule": _format_class_group_schedule(
                    class_group
                ),
                "enrollment_status": status_labels.get(status, status.value),
                "status_message": status_messages.get(status, ""),
                "schedule_link": schedule_link,
            },
        ),
        "enrollment_confirmation_dark.html",
    )


async def send_new_charge_email(user: User, charge: Charge) -> None:
    settings = get_settings()
    user_full_name = f"{user.first_name} {user.last_name}".strip()
    billing_link = f"{settings.FRONTEND_BASE_URL}/billing"
    amount_due = f"{charge.amount_due:.2f}".replace(".", ",")
    due_date = charge.due_date.strftime("%d.%m.%Y")
    await send_with_template(
        EmailSchema(
            subject="TipTap - Nowa należność na Twoim koncie",
            email=[NameEmail(email=user.email, name=user_full_name)],
            body={
                "first_name": user.first_name,
                "amount_due": f"{amount_due} zł",
                "due_date": due_date,
                "charge_type": _format_charge_type(charge.type),
                "charge_id": charge.id,
                "billing_link": billing_link,
            },
        ),
        "new_charge_dark.html",
    )
