# Public product catalog endpoint for the storefront.
# 面向前台的公开商品目录接口。
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.domain.products.models import Product
from app.domain.products.schemas import ProductRead
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def list_products(
    db: Session = Depends(get_db),
    category_id: int | None = Query(default=None),
) -> list[Product]:
    query = db.query(Product).filter(Product.is_active.is_(True))
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    return query.order_by(Product.sort_order.asc(), Product.id.asc()).all()


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.is_active.is_(True))
        .first()
    )
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return product
