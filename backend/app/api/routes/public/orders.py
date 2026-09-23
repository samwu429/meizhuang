# Public order submission: validates stocked products and persists buyer details.
# 公开下单：校验在售商品并持久化买家信息。
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.domain.orders.models import Order
from app.domain.orders.schemas import OrderCreate, OrderItemRead, OrderRead
from app.domain.products.models import Product
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _order_to_read(order: Order) -> OrderRead:
    items = [OrderItemRead(**item) for item in json.loads(order.items_json)]
    return OrderRead(
        id=order.id,
        customer_name=order.customer_name,
        phone=order.phone,
        address=order.address,
        note=order.note,
        items=items,
        status=order.status,
        locale=order.locale,
        total_cents=order.total_cents,
        currency=order.currency,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderRead:
    line_items: list[dict] = []
    total = 0
    currency = "CAD"

    for line in payload.items:
        product = (
            db.query(Product)
            .filter(Product.id == line.product_id, Product.is_active.is_(True))
            .first()
        )
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {line.product_id} unavailable",
            )
        line_total = product.price_cents * line.qty
        total += line_total
        currency = product.currency
        line_items.append(
            {
                "product_id": product.id,
                "name_zh": product.name_zh,
                "name_en": product.name_en,
                "qty": line.qty,
                "price_cents": product.price_cents,
                "currency": product.currency,
            }
        )

    order = Order(
        customer_name=payload.customer_name.strip(),
        phone=payload.phone.strip(),
        address=payload.address.strip(),
        note=payload.note.strip(),
        items_json=json.dumps(line_items, ensure_ascii=False),
        status="pending",
        locale=payload.locale,
        total_cents=total,
        currency=currency,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return _order_to_read(order)
