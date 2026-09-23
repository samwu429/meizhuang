# Runtime configuration loaded from environment variables.
# 运行时配置，从环境变量加载。
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(_BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Postgres connection string for Neon or local Postgres; SQLite allowed for local-only smoke tests.
    # Neon/本地 Postgres 连接串；本地冒烟测试可使用 SQLite。
    database_url: str = "sqlite:///./meizhuang.db"

    admin_password: str = "change-me"
    admin_jwt_secret: str = "change-me-jwt-secret"
    admin_jwt_expire_hours: int = 24

    # Comma-separated browser origins allowed to call the API.
    # 允许调用 API 的浏览器来源，逗号分隔。
    cors_origins: str = (
        "http://localhost:5173,"
        "https://samwu429.github.io,"
        "https://topphi.com,"
        "http://topphi.com"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
