# Ensures the singleton StoreSettings row exists after schema creation.
# 在建表后确保单例 StoreSettings 行存在。
from sqlalchemy.orm import Session

from app.domain.settings.models import StoreSettings


def ensure_store_settings(db: Session) -> StoreSettings:
    row = db.query(StoreSettings).first()
    if row is None:
        row = StoreSettings(
            store_name="",
            wechat_qr_image=None,
            etransfer_email="",
            etransfer_note="",
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    return row
