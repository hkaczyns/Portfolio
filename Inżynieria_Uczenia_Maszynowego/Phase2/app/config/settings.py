import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Nocarz Price Prediction API"
    app_version: str = "1.0.0"

    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://nocarz:nocarz123@localhost:5436/nocarz_db",
    )

    baseline_model_path: str = os.getenv(
        "BASELINE_MODEL_PATH", "models/baseline_model.pkl"
    )
    advanced_model_path: str = os.getenv(
        "ADVANCED_MODEL_PATH", "models/advanced_model.pkl"
    )
    ab_test_advanced_probability: float = 0.5

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
