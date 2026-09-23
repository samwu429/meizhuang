# Seeds starter categories when the catalog has none.
# 分类表为空时写入初始分类。
from sqlalchemy.orm import Session

from app.domain.categories.models import Category

SAMPLE_CATEGORIES = [
    {"name_zh": "\u62a4\u80a4", "name_en": "Skincare", "sort_order": 1},
    {"name_zh": "\u6e05\u6d01", "name_en": "Cleansing", "sort_order": 2},
    {"name_zh": "\u5f69\u5986", "name_en": "Makeup", "sort_order": 3},
]


def seed_categories_if_empty(db: Session) -> None:
    if db.query(Category).count() > 0:
        return
    for item in SAMPLE_CATEGORIES:
        db.add(Category(**item, is_active=True))
    db.commit()
