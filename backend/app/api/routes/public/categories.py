# Public category list for storefront filters.
# 前台分类筛选使用的公开分类列表。
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.categories.models import Category
from app.domain.categories.schemas import CategoryRead
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db)) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.sort_order.asc(), Category.id.asc())
        .all()
    )
