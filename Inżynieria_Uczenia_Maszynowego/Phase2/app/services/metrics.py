import numpy as np

from db.models import Prediction


def calculate_metrics(predictions: list[Prediction]) -> dict:
    if not predictions:
        return {
            "mae": None,
            "rmse": None,
            "r2": None,
            "mean_predicted_price": None,
            "mean_actual_price": None,
        }

    predicted = np.array([p.predicted_price for p in predictions])
    actual = np.array([p.actual_price for p in predictions])
    mae = float(np.mean(np.abs(predicted - actual)))
    rmse = float(np.sqrt(np.mean((predicted - actual) ** 2)))

    ss_total = np.sum((actual - np.mean(actual)) ** 2)
    ss_residual = np.sum((actual - predicted) ** 2)
    r2 = 1 - (ss_residual / ss_total) if ss_total > 0 else None

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4) if r2 is not None else None,
        "mean_predicted_price": round(float(np.mean(predicted)), 2),
        "mean_actual_price": round(float(np.mean(actual)), 2),
    }
