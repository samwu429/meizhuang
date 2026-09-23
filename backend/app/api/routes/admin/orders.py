# Admin order listing, status updates, and archive toggles.
# 管理端订单列表、状态更新与归档切换。
import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.domain.orders.models import Order
from app.domain.orders.schemas import OrderAdminUpdate, OrderItemRead, OrderRead
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
        archived=bool(getattr(order, "archived", False)),
        locale=order.locale,
        total_cents=order.total_cents,
        currency=order.currency,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.get("", response_model=list[OrderRead])
def list_orders(
    db: Session = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    archived: bool | None = Query(default=None),
) -> list[OrderRead]:
    query = db.query(Order)
    if archived is not None:
        query = query.filter(Order.archived.is_(archived))
    if status_filter:
        query = query.filter(Order.status == status_filter)
    orders = query.order_by(Order.id.desc()).all()
    return [_order_to_read(o) for o in orders]


@router.patch("/{order_id}", response_model=OrderRead)
def update_order(
    order_id: int, payload: OrderAdminUpdate, db: Session = Depends(get_db)
) -> OrderRead:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty update")
    for key, value in data.items():
        setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return _order_to_read(order)
