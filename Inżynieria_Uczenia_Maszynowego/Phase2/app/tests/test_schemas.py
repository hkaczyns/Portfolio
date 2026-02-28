import pytest
from uuid import uuid4
from pydantic import ValidationError

from schemas import (
    PredictionInput,
    PredictionResponse,
    SetPriceInput,
    SetPriceResponse,
    ModelMetrics,
    ABTestResults,
)


def test_valid_prediction_input():
    data = PredictionInput(
        accommodates=4,
        bedrooms=2,
        beds=2,
        bathrooms=1,
        room_type="Entire home/apt",
        property_type="Entire villa",
        neighbourhood_cleansed="Palma de Mallorca",
        host_is_superhost="t",
    )

    assert data.accommodates == 4
    assert data.room_type == "Entire home/apt"


def test_minimal_valid_input():
    data = PredictionInput(
        accommodates=2,
        room_type="Private room",
        property_type="Entire home",
        neighbourhood_cleansed="Alcúdia",
    )

    assert data.accommodates == 2
    assert data.bedrooms is None


def test_accommodates_validation_min():
    with pytest.raises(ValidationError):
        PredictionInput(
            accommodates=0,
            room_type="Entire home/apt",
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
        )


def test_accommodates_validation_max():
    with pytest.raises(ValidationError):
        PredictionInput(
            accommodates=25,
            room_type="Entire home/apt",
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
        )


def test_missing_required_field():
    with pytest.raises(ValidationError):
        PredictionInput(
            accommodates=4,
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
        )  # type: ignore


def test_superhost_normalization_true():
    for value in ["t", "true", "True", "TRUE", "yes"]:
        data = PredictionInput(
            accommodates=4,
            room_type="Entire home/apt",
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
            host_is_superhost=value,
        )
        assert data.host_is_superhost == "t"


def test_superhost_normalization_false():
    for value in ["f", "false", "False", "FALSE", "no"]:
        data = PredictionInput(
            accommodates=4,
            room_type="Entire home/apt",
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
            host_is_superhost=value,
        )
        assert data.host_is_superhost == "f"


def test_amenities_optional():
    data = PredictionInput(
        accommodates=4,
        room_type="Entire home/apt",
        property_type="Entire villa",
        neighbourhood_cleansed="Palma de Mallorca",
    )

    assert data.amenities is None


def test_amenities_string():
    data = PredictionInput(
        accommodates=4,
        room_type="Entire home/apt",
        property_type="Entire villa",
        neighbourhood_cleansed="Palma de Mallorca",
        amenities="Pool,BBQ grill,Dishwasher",
    )

    assert data.amenities is not None
    assert "Pool" in data.amenities


def test_bedrooms_negative():
    with pytest.raises(ValidationError):
        PredictionInput(
            accommodates=4,
            bedrooms=-1,
            room_type="Entire home/apt",
            property_type="Entire villa",
            neighbourhood_cleansed="Palma de Mallorca",
        )


def test_valid_set_price_input():
    pred_id = uuid4()
    data = SetPriceInput(
        prediction_id=pred_id,
        actual_price=200.00,
    )

    assert data.prediction_id == pred_id
    assert data.actual_price == 200.00


def test_negative_price():
    with pytest.raises(ValidationError):
        SetPriceInput(
            prediction_id=uuid4(),
            actual_price=-50.00,
        )


def test_zero_price():
    data = SetPriceInput(
        prediction_id=uuid4(),
        actual_price=0.00,
    )

    assert data.actual_price == 0.00


def test_invalid_uuid():
    with pytest.raises(ValidationError):
        SetPriceInput(
            prediction_id="not-a-uuid",  # type: ignore
            actual_price=200.00,
        )


def test_valid_prediction_response():
    pred_id = uuid4()
    data = PredictionResponse(
        prediction_id=pred_id,
        predicted_price=185.50,
    )

    assert data.prediction_id == pred_id
    assert data.predicted_price == 185.50


def test_negative_price_rejected():
    with pytest.raises(ValidationError):
        PredictionResponse(
            prediction_id=uuid4(),
            predicted_price=-10.00,
        )


def test_valid_set_price_response():
    pred_id = uuid4()
    data = SetPriceResponse(
        prediction_id=pred_id,
        predicted_price=185.50,
        actual_price=200.00,
        error=14.50,
    )

    assert data.prediction_id == pred_id
    assert data.error == 14.50


def test_negative_error_allowed():
    data = SetPriceResponse(
        prediction_id=uuid4(),
        predicted_price=200.00,
        actual_price=180.00,
        error=-20.00,
    )

    assert data.error == -20.00


def test_valid_metrics():
    data = ModelMetrics(
        model_type="baseline",
        num_predictions=100,
        num_evaluated=80,
        mae=95.50,
        rmse=142.30,
        r2=0.45,
        mean_predicted_price=245.00,
        mean_actual_price=250.00,
    )

    assert data.model_type == "baseline"
    assert data.num_predictions == 100


def test_null_metrics_allowed():
    data = ModelMetrics(
        model_type="advanced",
        num_predictions=50,
        num_evaluated=0,
        mae=None,
        rmse=None,
        r2=None,
        mean_predicted_price=None,
        mean_actual_price=None,
    )

    assert data.mae is None
    assert data.num_evaluated == 0


def test_negative_counts_rejected():
    with pytest.raises(ValidationError):
        ModelMetrics(
            model_type="baseline",
            num_predictions=-1,
            num_evaluated=0,
            mae=None,
            rmse=None,
            r2=None,
            mean_predicted_price=None,
            mean_actual_price=None,
        )


def test_valid_ab_test_results():
    baseline = ModelMetrics(
        model_type="baseline",
        num_predictions=50,
        num_evaluated=40,
        mae=100.00,
        rmse=150.00,
        r2=0.42,
        mean_predicted_price=240.00,
        mean_actual_price=245.00,
    )

    advanced = ModelMetrics(
        model_type="advanced",
        num_predictions=50,
        num_evaluated=40,
        mae=90.00,
        rmse=140.00,
        r2=0.48,
        mean_predicted_price=245.00,
        mean_actual_price=248.00,
    )

    data = ABTestResults(
        total_predictions=100,
        total_evaluated=80,
        baseline=baseline,
        advanced=advanced,
    )

    assert data.total_predictions == 100
    assert data.baseline.model_type == "baseline"
    assert data.advanced.model_type == "advanced"


def test_empty_results():
    baseline = ModelMetrics(
        model_type="baseline",
        num_predictions=0,
        num_evaluated=0,
        mae=None,
        rmse=None,
        r2=None,
        mean_predicted_price=None,
        mean_actual_price=None,
    )

    advanced = ModelMetrics(
        model_type="advanced",
        num_predictions=0,
        num_evaluated=0,
        mae=None,
        rmse=None,
        r2=None,
        mean_predicted_price=None,
        mean_actual_price=None,
    )

    data = ABTestResults(
        total_predictions=0,
        total_evaluated=0,
        baseline=baseline,
        advanced=advanced,
    )

    assert data.total_predictions == 0
