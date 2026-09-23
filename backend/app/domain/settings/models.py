# Singleton store settings for brand name and payment instructions.
# 店名与收款说明的单例店铺设置。
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class StoreSettings(Base):
    __tablename__ = "store_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Left empty until the operator sets a real brand name in admin.
    # 在运营者于后台填写真实店名之前保持为空。
    store_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    wechat_qr_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    etransfer_email: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    etransfer_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now, onupdate=_utc_now
    )
