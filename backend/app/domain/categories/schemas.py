# Pydantic schemas for category create/update/read contracts.
# 分类创建、更新与读取契约。
from datetime import datetime

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name_zh: str = Field(min_length=1, max_length=80)
    name_en: str = Field(default="", max_length=80)
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name_zh: str | None = Field(default=None, min_length=1, max_length=80)
    name_en: str | None = Field(default=None, max_length=80)
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
