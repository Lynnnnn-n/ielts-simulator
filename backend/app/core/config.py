from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://ielts:ielts@localhost:5432/ielts_simulator"
    asset_storage_path: str = "./storage/assets"
    public_asset_base_url: str = "/assets"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    admin_token: str = "change-me-for-local-development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
