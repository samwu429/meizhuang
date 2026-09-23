# Pydantic schemas for product create/update/read contracts.
# 商品创建、更新与读取契约的 Pydantic 模式。
from datetime import datetime

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name_zh: str = Field(min_length=1, max_length=200)
    name_en: str = Field(default="", max_length=200)
    description_zh: str = ""
    description_en: str = ""
    price_cents: int = Field(ge=0)
    currency: str = Field(default="CAD", max_length=8)
    image_data: str | None = None
    category_id: int | None = None
    is_active: bool = True
    sort_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name_zh: str | None = Field(default=None, min_length=1, max_length=200)
    name_en: str | None = Field(default=None, max_length=200)
    description_zh: str | None = None
    description_en: str | None = None
    price_cents: int | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, max_length=8)
    image_data: str | None = None
    category_id: int | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ProductRead(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
