# Admin order listing and status updates for fulfillment.
# 履约用的管理端订单列表与状态更新。
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.domain.orders.models import Order
from app.domain.orders.schemas import OrderItemRead, OrderRead, OrderStatusUpdate
from app.infrastructure.auth.deps import require_admin
from app.infrastructure.database.session import get_db

router = APIRouter(
    prefix="/api/admin/orders",
    tags=["admin-orders"],
    dependencies=[Depends(require_admin)],
)


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


@router.get("", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[OrderRead]:
    orders = db.query(Order).order_by(Order.id.desc()).all()
    return [_order_to_read(o) for o in orders]


@router.patch("/{order_id}", response_model=OrderRead)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
) -> OrderRead:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _order_to_read(order)
