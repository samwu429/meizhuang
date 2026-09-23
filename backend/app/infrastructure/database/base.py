# SQLAlchemy declarative base shared by all domain models.
# 所有领域模型共享的 SQLAlchemy 声明基类。
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
