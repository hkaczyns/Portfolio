from uuid import uuid4
import uuid
from fastapi.testclient import TestClient


def test_health_check_returns_200(client: TestClient):
    response = client.get("/nocarz/health")
    assert response.status_code == 200


def test_health_check_returns_healthy_status(client: TestClient):
    response = client.get("/nocarz/health")
    data = response.json()
    assert data["status"] == "ok"


def test_health_check_confirms_models_loaded(client: TestClient):
    response = client.get("/nocarz/health")
    data = response.json()
    assert data["models_loaded"] is True


def test_predict_returns_200(client: TestClient, sample_listing_basic: dict):
    response = client.get("/nocarz/predict", params=sample_listing_basic)
    assert response.status_code == 200


def test_predict_returns_prediction_id(
    client: TestClient, sample_listing_basic: dict
):
    response = client.get("/nocarz/predict", params=sample_listing_basic)
    data = response.json()

    assert "prediction_id" in data
    assert data["prediction_id"] is not None


def test_predict_returns_predicted_price(
    client: TestClient, sample_listing_basic: dict
):
    response = client.get("/nocarz/predict", params=sample_listing_basic)
    data = response.json()

    assert "predicted_price" in data
    assert isinstance(data["predicted_price"], (int, float))
    assert data["predicted_price"] >= 0


def test_predict_with_amenities(
    client: TestClient, sample_listing_with_amenities: dict
):
    response = client.get(
        "/nocarz/predict", params=sample_listing_with_amenities
    )
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_price"] >= 0


def test_predict_missing_required_field(client: TestClient):
    params = {
        "room_type": "Entire home/apt",
        "property_type": "Entire villa",
        "neighbourhood_cleansed": "Palma de Mallorca",
    }

    response = client.get("/nocarz/predict", params=params)

    assert response.status_code == 422


def test_predict_invalid_accommodates(
    client: TestClient, sample_listing_basic: dict
):
    sample_listing_basic["accommodates"] = 0
    response = client.get("/nocarz/predict", params=sample_listing_basic)
    assert response.status_code == 422


def test_predict_stores_in_database(
    client: TestClient, db_session, sample_listing_basic: dict
):
    from db.models import Prediction

    response = client.get("/nocarz/predict", params=sample_listing_basic)
    data = response.json()

    prediction_id = uuid.UUID(data["prediction_id"])
    prediction = (
        db_session.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    assert prediction is not None
    assert prediction.predicted_price == data["predicted_price"]


def test_predict_stores_correct_model_type(
    client: TestClient, db_session, sample_listing_basic: dict
):
    from db.models import Prediction

    response = client.get("/nocarz/predict", params=sample_listing_basic)
    data = response.json()

    prediction_id = uuid.UUID(data["prediction_id"])
    prediction = (
        db_session.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    assert prediction.model_type in ["baseline", "advanced"]


def test_set_price_returns_200(client: TestClient, sample_prediction):
    response = client.post(
        "/nocarz/set_price",
        json={
            "prediction_id": str(sample_prediction.id),
            "actual_price": 200.00,
        },
    )

    assert response.status_code == 200


def test_set_price_returns_all_fields(client: TestClient, sample_prediction):
    response = client.post(
        "/nocarz/set_price",
        json={
            "prediction_id": str(sample_prediction.id),
            "actual_price": 200.00,
        },
    )
    data = response.json()

    assert "prediction_id" in data
    assert "predicted_price" in data
    assert "actual_price" in data
    assert "error" in data


def test_set_price_calculates_error(client: TestClient, sample_prediction):
    actual_price = 200.00

    response = client.post(
        "/nocarz/set_price",
        json={
            "prediction_id": str(sample_prediction.id),
            "actual_price": actual_price,
        },
    )
    data = response.json()

    expected_error = actual_price - sample_prediction.predicted_price
    assert abs(data["error"] - expected_error) < 0.01


def test_set_price_invalid_prediction_id(client: TestClient):
    fake_id = str(uuid4())

    response = client.post(
        "/nocarz/set_price",
        json={"prediction_id": fake_id, "actual_price": 200.00},
    )

    assert response.status_code == 404


def test_set_price_already_set(
    client: TestClient, sample_prediction, db_session
):
    response1 = client.post(
        "/nocarz/set_price",
        json={
            "prediction_id": str(sample_prediction.id),
            "actual_price": 200.00,
        },
    )
    assert response1.status_code == 200

    response2 = client.post(
        "/nocarz/set_price",
        json={
            "prediction_id": str(sample_prediction.id),
            "actual_price": 250.00,
        },
    )
    assert response2.status_code == 400


def test_set_price_updates_database(
    client: TestClient, sample_prediction, db_session
):
    actual_price = 200.00
    client.post(
        "/nocarz/set_price",
        json={
            "prediction_id": str(sample_prediction.id),
            "actual_price": actual_price,
        },
    )
    db_session.refresh(sample_prediction)
    assert sample_prediction.actual_price == actual_price
    assert sample_prediction.price_set_at is not None


def test_set_price_negative_price(client: TestClient, sample_prediction):
    response = client.post(
        "/nocarz/set_price",
        json={"prediction_id": str(sample_prediction.id), "price": -50.00},
    )

    assert response.status_code == 422


def test_results_returns_200(client: TestClient):
    response = client.get("/nocarz/results")

    assert response.status_code == 200


def test_results_returns_total_predictions(client: TestClient):
    response = client.get("/nocarz/results")
    data = response.json()

    assert "total_predictions" in data
    assert isinstance(data["total_predictions"], int)


def test_results_returns_model_metrics(client: TestClient):
    response = client.get("/nocarz/results")
    data = response.json()

    assert "baseline" in data
    assert "advanced" in data


def test_results_baseline_has_required_fields(client: TestClient):
    response = client.get("/nocarz/results")
    data = response.json()

    baseline = data["baseline"]
    required_fields = [
        "model_type",
        "num_predictions",
        "num_evaluated",
        "mae",
        "rmse",
        "r2",
        "mean_predicted_price",
        "mean_actual_price",
    ]

    for field in required_fields:
        assert field in baseline


def test_results_with_predictions(client: TestClient, multiple_predictions):
    response = client.get("/nocarz/results")
    data = response.json()

    assert data["total_predictions"] == 10
    assert data["total_evaluated"] == 7


def test_results_baseline_count(client: TestClient, multiple_predictions):
    response = client.get("/nocarz/results")
    data = response.json()

    assert data["baseline"]["num_predictions"] == 5
    assert data["baseline"]["num_evaluated"] == 3


def test_results_advanced_count(client: TestClient, multiple_predictions):
    response = client.get("/nocarz/results")
    data = response.json()

    assert data["advanced"]["num_predictions"] == 5
    assert data["advanced"]["num_evaluated"] == 4


def test_results_metrics_calculated(client: TestClient, multiple_predictions):
    response = client.get("/nocarz/results")
    data = response.json()

    assert data["baseline"]["mae"] is not None
    assert data["baseline"]["rmse"] is not None
    assert data["advanced"]["mae"] is not None
    assert data["advanced"]["rmse"] is not None
