import sys
from pathlib import Path
from typing import Generator
from uuid import uuid4

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))

from db.database import Base, get_db
from db.models import Prediction
from main import app
from services.model_service import ModelService, get_model_service

TEST_DATABASE_URL = "sqlite:///./test_nocarz.db"

test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="module")
def model_service() -> ModelService:
    return get_model_service()


@pytest.fixture
def sample_listing_basic() -> dict:
    return {
        "accommodates": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1,
        "room_type": "Entire home/apt",
        "property_type": "Entire villa",
        "neighbourhood_cleansed": "Palma de Mallorca",
        "host_is_superhost": "t",
    }


@pytest.fixture
def sample_listing_with_amenities() -> dict:
    return {
        "accommodates": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 2,
        "room_type": "Entire home/apt",
        "property_type": "Entire villa",
        "neighbourhood_cleansed": "Andratx",
        "host_is_superhost": "t",
        "amenities": "Pool,BBQ grill,Dishwasher",
    }


@pytest.fixture
def sample_listing_minimal() -> dict:
    return {
        "accommodates": 2,
        "room_type": "Private room",
        "property_type": "Entire home",
        "neighbourhood_cleansed": "Alcúdia",
    }


@pytest.fixture
def sample_listing_luxury() -> dict:
    return {
        "accommodates": 10,
        "bedrooms": 5,
        "beds": 6,
        "bathrooms": 4,
        "room_type": "Entire home/apt",
        "property_type": "Entire villa",
        "neighbourhood_cleansed": "Andratx",
        "host_is_superhost": "t",
        "amenities": "Pool,BBQ grill,Dishwasher,Bathtub,Indoor fireplace,Free parking on premises",
    }


@pytest.fixture
def sample_prediction(db_session: Session) -> Prediction:
    prediction = Prediction(
        model_type="baseline",
        accommodates=4,
        bedrooms=2.0,
        beds=2.0,
        bathrooms=1.0,
        room_type="Entire home/apt",
        property_type="Entire villa",
        neighbourhood_cleansed="Palma de Mallorca",
        host_is_superhost="t",
        amenities=None,
        predicted_price=185.50,
    )
    db_session.add(prediction)
    db_session.commit()
    db_session.refresh(prediction)
    return prediction


@pytest.fixture
def multiple_predictions(db_session: Session) -> list:
    predictions = []
    for i in range(5):
        pred = Prediction(
            model_type="baseline",
            accommodates=4 + i,
            bedrooms=2.0,
            beds=2.0,
            bathrooms=1.0,
            room_type="Entire home/apt",
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
            host_is_superhost="t",
            predicted_price=150.0 + i * 20,
            actual_price=(160.0 + i * 18 if i < 3 else None),
        )
        predictions.append(pred)

    for i in range(5):
        pred = Prediction(
            model_type="advanced",
            accommodates=4 + i,
            bedrooms=2.0,
            beds=2.0,
            bathrooms=1.0,
            room_type="Entire home/apt",
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
            host_is_superhost="t",
            amenities="Pool,BBQ grill",
            predicted_price=145.0 + i * 22,
            actual_price=155.0 + i * 20 if i < 4 else None,
        )
        predictions.append(pred)

    db_session.add_all(predictions)
    db_session.commit()
    return predictions


@pytest.fixture
def valid_uuid() -> str:
    return str(uuid4())


@pytest.fixture
def invalid_uuid() -> str:
    return "not-a-valid-uuid"
