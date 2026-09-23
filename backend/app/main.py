# FastAPI application entry: CORS, routers, schema bootstrap, and seed data.
# FastAPI 应用入口：CORS、路由、建表引导与种子数据。
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.admin import auth as admin_auth
from app.api.routes.admin import orders as admin_orders
from app.api.routes.admin import products as admin_products
from app.api.routes.admin import settings as admin_settings
from app.api.routes.public import orders as public_orders
from app.api.routes.public import products as public_products
from app.api.routes.public import settings as public_settings
from app.domain.products.services import seed_products_if_empty
from app.domain.settings.services import ensure_store_settings
from app.infrastructure.config.settings import get_settings
from app.infrastructure.database.base import Base
from app.infrastructure.database.session import SessionLocal, engine

# Import models so metadata registers before create_all.
# 导入模型以便 create_all 前完成元数据注册。
from app.domain.orders import models as _order_models  # noqa: F401
from app.domain.products import models as _product_models  # noqa: F401
from app.domain.settings import models as _settings_models  # noqa: F401


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_store_settings(db)
        seed_products_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Meizhuang API", lifespan=lifespan)

_settings = get_settings()
_origins = [o.strip() for o in _settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_products.router)
app.include_router(public_settings.router)
app.include_router(public_orders.router)
app.include_router(admin_auth.router)
app.include_router(admin_products.router)
app.include_router(admin_orders.router)
app.include_router(admin_settings.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
