from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db import get_db, Prediction
from schemas import (
    PredictionResponse,
    SetPriceInput,
    SetPriceResponse,
    ModelMetrics,
    ABTestResults,
)
from services import get_model_service, calculate_metrics

router = APIRouter(prefix="/nocarz", tags=["nocarz"])


@router.get("/health")
def health_check():
    model_service = get_model_service()
    return {
        "status": "ok",
        "models_loaded": model_service.baseline_model is not None
        and model_service.advanced_model is not None,
    }


@router.get("/predict", response_model=PredictionResponse)
def get_prediction(
    accommodates: int = Query(
        ...,
        ge=1,
        le=20,
        description="Number of guests the property can accommodate",
    ),
    bedrooms: float | None = Query(
        None, ge=0, le=20, description="Number of bedrooms in the property"
    ),
    beds: float | None = Query(
        None, ge=0, le=30, description="Number of beds in the property"
    ),
    bathrooms: float | None = Query(
        None, ge=0, le=20, description="Number of bathrooms in the property"
    ),
    room_type: str = Query(
        ...,
        description="Type of room being offered (e.g., Entire home/apt, Private room)",
    ),
    property_type: str = Query(
        ...,
        description="Type of property (e.g., 'Entire villa', 'Entire home')",
    ),
    neighbourhood_cleansed: str = Query(
        ...,
        description="Name of the neighbourhood where the property is located",
    ),
    host_is_superhost: str | None = Query(
        None,
        description="Indicates if the host is a superhost ('t' for true, 'f' for false)",
    ),
    amenities: str | None = Query(
        None,
        description="Comma-separated list of amenities provided by the property (e.g., 'Pool,BBQ grill,Dishwasher')",
    ),
    db: Session = Depends(get_db),
):
    if host_is_superhost is not None:
        if host_is_superhost.lower() in ["t", "true", "yes"]:
            host_is_superhost = "t"
        elif host_is_superhost.lower() in ["f", "false", "no"]:
            host_is_superhost = "f"
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid value for host_is_superhost. Use 't' or 'f'.",
            )
    model_service = get_model_service()
    model_type, predicted_price = model_service.predict_price(
        accommodates,
        bedrooms,
        beds,
        bathrooms,
        room_type,
        property_type,
        neighbourhood_cleansed,
        host_is_superhost,
        amenities,
    )
    prediction = Prediction(
        model_type=model_type,
        accommodates=accommodates,
        bedrooms=bedrooms,
        beds=beds,
        bathrooms=bathrooms,
        room_type=room_type,
        property_type=property_type,
        neighbourhood_cleansed=neighbourhood_cleansed,
        host_is_superhost=host_is_superhost,
        amenities=amenities,
        predicted_price=predicted_price,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return PredictionResponse(
        prediction_id=prediction.id, predicted_price=predicted_price
    )


@router.post("/set_price", response_model=SetPriceResponse)
def set_actual_price(
    input_data: SetPriceInput,
    db: Session = Depends(get_db),
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == input_data.prediction_id)
        .first()
    )
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail=f"Prediction with ID {input_data.prediction_id} not found.",
        )

    if prediction.actual_price is not None:
        raise HTTPException(
            status_code=400,
            detail="Actual price has already been set for this prediction.",
        )

    prediction.actual_price = input_data.actual_price
    prediction.price_set_at = datetime.now()
    db.commit()
    db.refresh(prediction)

    error = abs(prediction.predicted_price - input_data.actual_price)

    return SetPriceResponse(
        prediction_id=prediction.id,
        predicted_price=prediction.predicted_price,
        actual_price=input_data.actual_price,
        error=error,
    )


@router.get("/results", response_model=ABTestResults)
def get_ab_test_results(
    db: Session = Depends(get_db),
):
    all_predictions = db.query(Prediction).all()

    baseline_predictions = [
        p for p in all_predictions if p.model_type == "baseline"
    ]
    advanced_predictions = [
        p for p in all_predictions if p.model_type == "advanced"
    ]

    baseline_evaluated = [
        p for p in baseline_predictions if p.actual_price is not None
    ]
    advanced_evaluated = [
        p for p in advanced_predictions if p.actual_price is not None
    ]
    baseline_metrics = calculate_metrics(baseline_evaluated)
    advanced_metrics = calculate_metrics(advanced_evaluated)

    baseline_metrics = ModelMetrics(
        model_type="baseline",
        num_predictions=len(baseline_predictions),
        num_evaluated=len(baseline_evaluated),
        **baseline_metrics,
    )
    advanced_metrics = ModelMetrics(
        model_type="advanced",
        num_predictions=len(advanced_predictions),
        num_evaluated=len(advanced_evaluated),
        **advanced_metrics,
    )
    return ABTestResults(
        total_predictions=len(all_predictions),
        total_evaluated=len(baseline_evaluated) + len(advanced_evaluated),
        baseline=baseline_metrics,
        advanced=advanced_metrics,
    )
