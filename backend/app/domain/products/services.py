# Seeds sample beauty products when the catalog is empty.
# 商品表为空时写入示例商品，并挂到已有分类上。
from sqlalchemy.orm import Session

from app.domain.categories.models import Category
from app.domain.products.models import Product


SAMPLE_PRODUCTS = [
    {
        "name_zh": "\u6c34\u6da6\u7cbe\u534e\u9762\u971c",
        "name_en": "Hydrating Essence Cream",
        "description_zh": "\u8f7b\u76c8\u8d28\u5730\uff0c\u9002\u5408\u5e72\u71e5\u808c\u80a4\u7684\u65e5\u5e38\u4fdd\u6e7f\u3002",
        "description_en": "Lightweight daily moisturizer for dry skin.",
        "price_cents": 4599,
        "sort_order": 1,
        "category_zh": "\u62a4\u80a4",
    },
    {
        "name_zh": "\u6e29\u67d4\u6d01\u9762\u6ce1\u6cab",
        "name_en": "Gentle Foaming Cleanser",
        "description_zh": "\u4f4e\u523a\u6fc0\u6ce1\u6cab\u6d01\u9762\uff0c\u6d17\u540e\u4e0d\u7d27\u7ef7\u3002",
        "description_en": "Low-irritation foaming cleanser that leaves skin soft.",
        "price_cents": 2899,
        "sort_order": 2,
        "category_zh": "\u6e05\u6d01",
    },
    {
        "name_zh": "\u4eae\u6cfd\u5507\u91c9",
        "name_en": "Glossy Lip Tint",
        "description_zh": "\u534a\u900f\u660e\u6c34\u6da6\u8272\u6cfd\uff0c\u65e5\u5e38\u4e0e\u7ea6\u4f1a\u7686\u5b9c\u3002",
        "description_en": "Sheer glossy tint for everyday and evening looks.",
        "price_cents": 2499,
        "sort_order": 3,
        "category_zh": "\u5f69\u5986",
    },
]


def seed_products_if_empty(db: Session) -> None:
    if db.query(Product).count() > 0:
        return
    categories = {row.name_zh: row.id for row in db.query(Category).all()}
    for item in SAMPLE_PRODUCTS:
        payload = dict(item)
        category_zh = payload.pop("category_zh")
        db.add(
            Product(
                **payload,
                category_id=categories.get(category_zh),
                currency="CAD",
                is_active=True,
                image_data=None,
            )
        )
    db.commit()
