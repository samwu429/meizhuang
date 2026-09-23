# Pydantic schemas for order submission and admin status updates.
# 订单提交与后台状态更新的 Pydantic 模式。
from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemIn(BaseModel):
    product_id: int
    qty: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=5, max_length=40)
    address: str = Field(min_length=1)
    note: str = ""
    locale: str = Field(default="zh", max_length=8)
    items: list[OrderItemIn] = Field(min_length=1)


class OrderItemRead(BaseModel):
    product_id: int
    name_zh: str
    name_en: str
    qty: int
    price_cents: int
    currency: str


class OrderRead(BaseModel):
    id: int
    customer_name: str
    phone: str
    address: str
    note: str
    items: list[OrderItemRead]
    status: str
    locale: str
    total_cents: int
    currency: str
    created_at: datetime
    updated_at: datetime


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|paid|shipped|cancelled)$")
