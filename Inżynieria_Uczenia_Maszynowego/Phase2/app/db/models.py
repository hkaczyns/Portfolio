import uuid
from datetime import datetime

from sqlalchemy import String, Float, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    model_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # baseline / advanced

    accommodates: Mapped[int] = mapped_column(Integer, nullable=False)
    bedrooms: Mapped[float | None] = mapped_column(Float, nullable=True)
    beds: Mapped[float | None] = mapped_column(Float, nullable=True)
    bathrooms: Mapped[float | None] = mapped_column(Float, nullable=True)
    room_type: Mapped[str] = mapped_column(String(100), nullable=False)
    property_type: Mapped[str] = mapped_column(String(100), nullable=False)
    neighbourhood_cleansed: Mapped[str] = mapped_column(
        String(200), nullable=False
    )
    host_is_superhost: Mapped[str | None] = mapped_column(
        String(10), nullable=True
    )
    amenities: Mapped[str | None] = mapped_column(Text, nullable=True)

    predicted_price: Mapped[float] = mapped_column(Float, nullable=False)
    actual_price: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(), nullable=False
    )
    price_set_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )
