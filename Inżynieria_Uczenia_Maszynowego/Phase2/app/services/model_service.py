import logging
import pickle
import random
from pathlib import Path
from typing import Tuple

import pandas as pd
from sklearn.pipeline import Pipeline

import utils.logging  # noqa: F401
from config.settings import get_settings

settings = get_settings()

logger = logging.getLogger(__name__)


class ModelService:
    AMENITIES = [
        "BBQ grill",
        "Dishwasher",
        "Pool",
        "Barbecue utensils",
        "Bathtub",
        "Free parking on premises",
        "Indoor fireplace",
        "Extra pillows and blankets",
        "Free street parking",
    ]

    def __init__(self):
        self.baseline_model: Pipeline | None = None
        self.advanced_model: Pipeline | None = None
        self.load_models()

    def load_models(self):
        base_path = Path(__file__).parent.parent
        baseline_path = base_path / settings.baseline_model_path
        advanced_path = base_path / settings.advanced_model_path

        logger.info(f"Loading baseline model from {baseline_path}")
        with open(baseline_path, "rb") as f:
            self.baseline_model = pickle.load(f)
        logger.info(f"Loading advanced model from {advanced_path}")
        with open(advanced_path, "rb") as f:
            self.advanced_model = pickle.load(f)
        logger.info("Models loaded successfully.")

    def _parse_amenities(self, amenities_str: str) -> list:
        if not amenities_str:
            return []
        return [
            amenity.strip()
            for amenity in amenities_str.split(",")
            if amenity.strip()
        ]

    def _prepare_baseline_features(
        self,
        accommodates: int,
        bedrooms: float | None = None,
        beds: float | None = None,
        bathrooms: float | None = None,
        room_type: str = "",
        property_type: str = "",
        neighbourhood_cleansed: str = "",
        host_is_superhost: str | None = None,
    ) -> pd.DataFrame:
        return pd.DataFrame(
            [
                {
                    "accommodates": accommodates,
                    "bedrooms": bedrooms,
                    "beds": beds,
                    "bathrooms": bathrooms,
                    "room_type": room_type,
                    "property_type": property_type,
                    "neighbourhood_cleansed": neighbourhood_cleansed,
                    "host_is_superhost": host_is_superhost,
                }
            ]
        )

    def _prepare_advanced_features(
        self,
        accommodates: int,
        bedrooms: float | None = None,
        beds: float | None = None,
        bathrooms: float | None = None,
        room_type: str = "",
        property_type: str = "",
        neighbourhood_cleansed: str = "",
        host_is_superhost: str | None = None,
        amenities: str = "",
    ) -> pd.DataFrame:
        amenities_list = self._parse_amenities(amenities)
        data = {
            "accommodates": accommodates,
            "bedrooms": bedrooms,
            "beds": beds,
            "bathrooms": bathrooms,
            "room_type": room_type,
            "property_type": property_type,
            "neighbourhood_cleansed": neighbourhood_cleansed,
            "host_is_superhost": host_is_superhost,
        }
        for amenity in self.AMENITIES:
            col_name = f"has_{amenity.lower().replace(' ', '_')}"
            data[col_name] = 1 if amenity in amenities_list else 0
        return pd.DataFrame([data])

    def select_model(self) -> Tuple[str, Pipeline] | Tuple[None, None]:
        if random.random() < settings.ab_test_advanced_probability:
            return (
                ("advanced", self.advanced_model)
                if self.advanced_model
                else (None, None)
            )

        else:
            return (
                ("baseline", self.baseline_model)
                if self.baseline_model
                else (None, None)
            )

    def predict_price(
        self,
        accommodates: int,
        bedrooms: float | None = None,
        beds: float | None = None,
        bathrooms: float | None = None,
        room_type: str = "",
        property_type: str = "",
        neighbourhood_cleansed: str = "",
        host_is_superhost: str | None = None,
        amenities: str | None = None,
    ) -> Tuple[str, float]:
        model_name, model = self.select_model()
        if model is None or model_name is None:
            raise ValueError("No model is loaded for prediction.")
        logger.info(f"Selected model type: {model_name}")

        if model_name == "advanced":
            features = self._prepare_advanced_features(
                accommodates,
                bedrooms,
                beds,
                bathrooms,
                room_type,
                property_type,
                neighbourhood_cleansed,
                host_is_superhost,
                amenities or "",
            )
        else:
            features = self._prepare_baseline_features(
                accommodates,
                bedrooms,
                beds,
                bathrooms,
                room_type,
                property_type,
                neighbourhood_cleansed,
                host_is_superhost,
            )

        predicted_price = float(model.predict(features)[0])
        predicted_price = max(0, predicted_price)
        logger.info(f"Predicted price: {predicted_price}")
        return model_name, predicted_price


_model_service: ModelService | None = None


def get_model_service() -> ModelService:
    global _model_service
    if _model_service is None:
        _model_service = ModelService()
    return _model_service
