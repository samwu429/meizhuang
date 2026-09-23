# Database engine and session factory bound to DATABASE_URL.
# 绑定 DATABASE_URL 的数据库引擎与会话工厂。
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.infrastructure.config.settings import get_settings


def _normalize_database_url(url: str) -> str:
    # Neon and Render often provide postgres://; SQLAlchemy 2 + psycopg3 need postgresql+psycopg://.
    # Neon 与 Render 常提供 postgres://；SQLAlchemy 2 与 psycopg3 需使用 postgresql+psycopg://。
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


_settings = get_settings()
_database_url = _normalize_database_url(_settings.database_url)
if _database_url.startswith("sqlite"):
    _connect_args: dict = {"check_same_thread": False}
else:
    # PgBouncer (Neon pooler) rejects prepared statements.
    _connect_args = {"prepare_threshold": None}

engine = create_engine(
    _database_url,
    connect_args=_connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
