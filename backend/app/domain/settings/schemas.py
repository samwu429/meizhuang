# Pydantic schemas for public payment display and admin settings edits.
# 公开收款展示与后台设置编辑的 Pydantic 模式。
from datetime import datetime

from pydantic import BaseModel, Field


class PublicSettingsRead(BaseModel):
    store_name: str
    wechat_qr_image: str | None
    etransfer_email: str
    etransfer_note: str


class AdminSettingsRead(PublicSettingsRead):
    id: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdminSettingsUpdate(BaseModel):
    store_name: str | None = Field(default=None, max_length=200)
    wechat_qr_image: str | None = None
    etransfer_email: str | None = Field(default=None, max_length=200)
    etransfer_note: str | None = None
