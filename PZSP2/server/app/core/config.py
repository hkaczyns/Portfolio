from enum import Enum
from functools import lru_cache
import os
from pathlib import Path
import sys
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr, PostgresDsn, SecretStr, computed_field


class AppEnv(str, Enum):
    development = "development"
    production = "production"
    test = "test"


class Bootstrap(BaseSettings):
    APP_ENV: AppEnv = AppEnv.development
    model_config = SettingsConfigDict(env_prefix="", case_sensitive=False)


class Settings(BaseSettings):
    # App settings
    PROJECT_NAME: str = "TipTap"
    APP_ENV: AppEnv = AppEnv.development
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    BACKEND_BASE_URL: str
    FRONTEND_BASE_URL: str

    # Database settings
    DB_SERVER: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_SERVER,
            port=self.DB_PORT,
            path=self.DB_NAME,
        )

    # Auth settings
    RESET_PASSWORD_SECRET: str
    VERIFICATION_TOKEN_SECRET: str
    COOKIE_NAME: str
    COOKIE_MAX_AGE: int = 604800
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"

    # Superuser settings
    FIRST_SUPERUSER_EMAIL: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    # Normal user settings
    FIRST_NORMAL_USER_EMAIL: EmailStr
    FIRST_NORMAL_USER_PASSWORD: str

    # Instructor user settings
    FIRST_INSTRUCTOR_EMAIL: EmailStr
    FIRST_INSTRUCTOR_PASSWORD: str

    # Email settings
    SEND_EMAILS: bool = False
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: SecretStr | None = None
    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: str | None = None
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48

    # Security settings
    ALLOWED_ORIGINS: list[str]

    model_config = SettingsConfigDict(env_prefix="", case_sensitive=False)


def _select_env_file(app_env: AppEnv) -> str | None:
    here = Path(__file__).resolve().parent
    if app_env == AppEnv.development:
        return str((here / "../../.env.dev").resolve())
    elif app_env == AppEnv.test:
        return str((here / "../../.env.test").resolve())
    return str((here / "../../../.env").resolve())


@lru_cache
def get_settings() -> Settings:
    boot = Bootstrap()
    app_env = boot.APP_ENV

    if os.getenv("APP_ENV") is None and (
        "PYTEST_CURRENT_TEST" in os.environ or "pytest" in sys.modules
    ):
        app_env = AppEnv.test

    env_file = _select_env_file(app_env)

    class EnvSettings(Settings):
        model_config = SettingsConfigDict(
            env_file=env_file, env_prefix="", case_sensitive=False
        )

    return EnvSettings()  # type: ignore
