# Public product catalog endpoint for the storefront.
# 面向前台的公开商品目录接口。
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.products.models import Product
from app.domain.products.schemas import ProductRead
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return (
        db.query(Product)
        .filter(Product.is_active.is_(True))
        .order_by(Product.sort_order.asc(), Product.id.asc())
        .all()
    )
