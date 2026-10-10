from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Cateye API"
    cors_origins: list[str] = ["http://localhost:3000"]
    database_url: str = "postgresql+psycopg://postgres@localhost:5432/cateye"
    jwt_secret_key: str = "change-this-development-secret-before-deploying"
    auth_token_minutes: int = 60 * 24 * 7
    auth_cookie_secure: bool = False

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        extra="ignore",
    )


settings = Settings()
