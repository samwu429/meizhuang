# Ensures older SQLite/Postgres databases gain newly added columns.
# 为已有 SQLite/Postgres 库补齐新增列。
from sqlalchemy import inspect, text

from app.infrastructure.database.session import engine


def ensure_schema_columns() -> None:
    inspector = inspect(engine)
    if "orders" not in inspector.get_table_names():
        return
    columns = {col["name"] for col in inspector.get_columns("orders")}
    if "archived" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE orders ADD COLUMN archived BOOLEAN DEFAULT FALSE NOT NULL")
            )
