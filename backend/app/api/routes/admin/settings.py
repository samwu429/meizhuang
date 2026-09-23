# Admin read/update for store name and payment instructions.
# 店名与收款说明的管理端读取与更新。
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.settings.schemas import AdminSettingsRead, AdminSettingsUpdate
from app.domain.settings.services import ensure_store_settings
from app.infrastructure.auth.deps import require_admin
from app.infrastructure.database.session import get_db

router = APIRouter(
    prefix="/api/admin/settings",
    tags=["admin-settings"],
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=AdminSettingsRead)
def get_settings(db: Session = Depends(get_db)) -> AdminSettingsRead:
    row = ensure_store_settings(db)
    return AdminSettingsRead.model_validate(row)


@router.put("", response_model=AdminSettingsRead)
def update_settings(
    payload: AdminSettingsUpdate, db: Session = Depends(get_db)
) -> AdminSettingsRead:
    row = ensure_store_settings(db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return AdminSettingsRead.model_validate(row)
