# Public store settings used on checkout payment instructions.
# 结账收款说明页使用的公开店铺设置。
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.settings.schemas import PublicSettingsRead
from app.domain.settings.services import ensure_store_settings
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/public", response_model=PublicSettingsRead)
def get_public_settings(db: Session = Depends(get_db)) -> PublicSettingsRead:
    row = ensure_store_settings(db)
    return PublicSettingsRead(
        store_name=row.store_name,
        wechat_qr_image=row.wechat_qr_image,
        etransfer_email=row.etransfer_email,
        etransfer_note=row.etransfer_note,
    )
