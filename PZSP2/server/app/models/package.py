from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import Enum
import uuid

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SqlEnum

from .base import Base


class PackageType(str, Enum):
    SEMESTER = "semester"
    MONTHLY = "monthly"
    SINGLE_ENTRY = "single_entry"
    MULTI_ENTRY = "multi_entry"


class UserPackageStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    USED = "used"


class Package(Base):
    __tablename__ = "package"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    package_type: Mapped[PackageType] = mapped_column(
        SqlEnum(PackageType, name="package_type"), nullable=False
    )
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    number_of_classes: Mapped[int | None] = mapped_column()
    validity_days: Mapped[int | None] = mapped_column()
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )


class UserPackage(Base):
    __tablename__ = "user_package"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )
    package_id: Mapped[int] = mapped_column(
        ForeignKey("package.id"), nullable=False
    )
    enrollment_id: Mapped[int | None] = mapped_column(
        ForeignKey("enrollment.id")
    )
    purchase_date: Mapped[date] = mapped_column(Date, nullable=False)
    activation_date: Mapped[date | None] = mapped_column(Date)
    expiry_date: Mapped[date | None] = mapped_column(Date)
    classes_remaining: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[UserPackageStatus] = mapped_column(
        SqlEnum(UserPackageStatus, name="user_package_status"),
        nullable=False,
        default=UserPackageStatus.ACTIVE,
    )
