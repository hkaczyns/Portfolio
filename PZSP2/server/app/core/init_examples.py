from __future__ import annotations

from datetime import date, datetime, time, timezone
from decimal import Decimal

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Attendance,
    Charge,
    ClassGroup,
    ClassSession,
    Enrollment,
    Payment,
    PaymentAllocation,
    Room,
    Semester,
    SkillLevel,
    Topic,
)
from app.models.attendance import AttendanceStatus
from app.models.enrollment import EnrollmentStatus
from app.models.payment import ChargeStatus, ChargeType, PaymentMethod
from app.models.schedule import ClassGroupStatus, ClassSessionStatus
from app.models.user import User

SEED_ROOM_NAME = "Sala A113"
SEED_LEVEL_NAME = "Poziom Średniozaawansowany"
SEED_TOPIC_NAME = "Salsa"
SEED_SEMESTER_NAME = "Semestr Zimowy 2026"
SEED_CLASS_GROUP_NAME = "Pierwsze zajęcia semestru"

SEED_SESSION_DATE = date(2026, 1, 22)
SEED_SESSION_START = time(18, 0)
SEED_SESSION_END = time(19, 30)
SEED_ATTENDANCE_MARKED_AT = datetime(2026, 1, 24, 19, 40, tzinfo=timezone.utc)
SEED_CHARGE_DUE_DATE = date(2026, 1, 25)
SEED_PAYMENT_AT = datetime(2026, 1, 24, 19, 0, tzinfo=timezone.utc)
SEED_PAYMENT_AMOUNT = Decimal("120.00")


async def _get_one(
    session: AsyncSession,
    model: type,
    *filters,
):
    result = await session.execute(select(model).where(*filters))
    return result.scalars().first()


async def _get_or_create_by_name(
    session: AsyncSession,
    model: type,
    name: str,
    **defaults,
):
    instance = await _get_one(session, model, model.name == name)
    if instance:
        return instance
    instance = model(name=name, **defaults)
    session.add(instance)
    await session.flush()
    return instance


async def _get_enum_values(
    session: AsyncSession,
    enum_name: str,
) -> list[str]:
    try:
        result = await session.execute(
            text(
                "SELECT enumlabel "
                "FROM pg_enum "
                "JOIN pg_type ON pg_enum.enumtypid = pg_type.oid "
                "WHERE pg_type.typname = :enum_name "
                "ORDER BY enumsortorder"
            ),
            {"enum_name": enum_name},
        )
    except Exception:
        return []
    return [row[0] for row in result]


async def init_examples(
    session: AsyncSession,
    admin_user: User,
    instructor_user: User,
    student_user: User,
) -> None:
    room = await _get_or_create_by_name(
        session,
        Room,
        SEED_ROOM_NAME,
        capacity=14,
        description="Powierzchnia do tańca z lustrami.",
        is_available_for_rental=True,
        hourly_rate=Decimal("80.00"),
        is_active=True,
    )

    level = await _get_or_create_by_name(
        session,
        SkillLevel,
        SEED_LEVEL_NAME,
        description="Utrwalenie kroków i praca z partnerem.",
    )

    topic = await _get_or_create_by_name(
        session,
        Topic,
        SEED_TOPIC_NAME,
        description="Salsa liniowa i kubańska.",
    )

    semester = await _get_or_create_by_name(
        session,
        Semester,
        SEED_SEMESTER_NAME,
        start_date=date(2026, 1, 1),
        end_date=date(2026, 3, 31),
        is_active=True,
        created_by=admin_user.id,
    )

    class_group = await _get_one(
        session,
        ClassGroup,
        ClassGroup.name == SEED_CLASS_GROUP_NAME,
        ClassGroup.instructor_id == instructor_user.id,
    )
    if not class_group:
        class_group = ClassGroup(
            semester_id=semester.id,
            name=SEED_CLASS_GROUP_NAME,
            description="Grupa dla początkujących, tempo spokojne.",
            level_id=level.id,
            topic_id=topic.id,
            room_id=room.id,
            capacity=14,
            day_of_week=2,
            start_time=SEED_SESSION_START,
            end_time=SEED_SESSION_END,
            instructor_id=instructor_user.id,
            is_public=True,
            status=ClassGroupStatus.OPEN,
        )
        session.add(class_group)
        await session.flush()

    class_session = await _get_one(
        session,
        ClassSession,
        ClassSession.class_group_id == class_group.id,
        ClassSession.date == SEED_SESSION_DATE,
    )
    if not class_session:
        class_session = ClassSession(
            class_group_id=class_group.id,
            date=SEED_SESSION_DATE,
            start_time=SEED_SESSION_START,
            end_time=SEED_SESSION_END,
            status=ClassSessionStatus.COMPLETED,
            instructor_id=instructor_user.id,
            room_id=room.id,
            notes="Pierwsze zajęcia semestru.",
        )
        session.add(class_session)
        await session.flush()

    class_session2 = await _get_one(
        session,
        ClassSession,
        ClassSession.class_group_id == class_group.id,
        ClassSession.date == SEED_SESSION_DATE.replace(day=27),
    )
    if not class_session2:
        class_session2 = ClassSession(
            class_group_id=class_group.id,
            date=SEED_SESSION_DATE.replace(day=27),
            start_time=SEED_SESSION_START,
            end_time=SEED_SESSION_END,
            status=ClassSessionStatus.SCHEDULED,
            instructor_id=instructor_user.id,
            room_id=room.id,
            notes="Drugie zajęcia semestru.",
        )
        session.add(class_session2)
        await session.flush()

    enrollment = await _get_one(
        session,
        Enrollment,
        Enrollment.student_id == student_user.id,
        Enrollment.class_group_id == class_group.id,
    )
    if not enrollment:
        enrollment = Enrollment(
            student_id=student_user.id,
            class_group_id=class_group.id,
            status=EnrollmentStatus.ACTIVE,
        )
        session.add(enrollment)
        await session.flush()

    attendance = await _get_one(
        session,
        Attendance,
        Attendance.class_session_id == class_session.id,
        Attendance.student_id == student_user.id,
    )
    if not attendance:
        attendance = Attendance(
            class_session_id=class_session.id,
            student_id=student_user.id,
            status=AttendanceStatus.PRESENT,
            marked_by=instructor_user.id,
            marked_at=SEED_ATTENDANCE_MARKED_AT,
            is_makeup=False,
        )
        session.add(attendance)

    charge = await _get_one(
        session,
        Charge,
        Charge.student_id == student_user.id,
        Charge.due_date == SEED_CHARGE_DUE_DATE,
        Charge.type == ChargeType.MONTHLY_FEE,
    )
    if not charge:
        charge = Charge(
            student_id=student_user.id,
            due_date=SEED_CHARGE_DUE_DATE,
            amount_due=SEED_PAYMENT_AMOUNT,
            type=ChargeType.MONTHLY_FEE,
            status=ChargeStatus.PAID,
            created_by=admin_user.id,
        )
        session.add(charge)
        await session.flush()

    payment_id = await session.scalar(
        select(Payment.id).where(
            Payment.user_id == student_user.id,
            Payment.paid_at == SEED_PAYMENT_AT,
            Payment.amount == SEED_PAYMENT_AMOUNT,
        )
    )
    if payment_id is None:
        payment_method_value: str | PaymentMethod = PaymentMethod.TRANSFER
        enum_values = await _get_enum_values(session, "payment_method")
        if "TRANSFER" in enum_values:
            payment_method_value = "TRANSFER"
        elif "transfer" in enum_values:
            payment_method_value = "transfer"
        payment = Payment(
            user_id=student_user.id,
            amount=SEED_PAYMENT_AMOUNT,
            paid_at=SEED_PAYMENT_AT,
            payment_method=payment_method_value,
            notes="Opłata za styczeń 2026.",
        )
        session.add(payment)
        await session.flush()
        payment_id = payment.id

    allocation_id = await session.scalar(
        select(PaymentAllocation.payment_id).where(
            PaymentAllocation.payment_id == payment_id,
            PaymentAllocation.charge_id == charge.id,
        )
    )
    if allocation_id is None:
        allocation = PaymentAllocation(
            payment_id=payment_id,
            charge_id=charge.id,
            amount_allocated=SEED_PAYMENT_AMOUNT,
        )
        session.add(allocation)

    await session.commit()
