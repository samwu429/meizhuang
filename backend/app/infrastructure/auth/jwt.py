# Admin JWT issuance and verification helpers.
# 管理端 JWT 签发与校验辅助函数。
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.infrastructure.config.settings import get_settings

ALGORITHM = "HS256"


def create_admin_token() -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.admin_jwt_expire_hours)
    return jwt.encode(
        {"sub": "admin", "exp": expire},
        settings.admin_jwt_secret,
        algorithm=ALGORITHM,
    )


def verify_admin_token(token: str) -> bool:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.admin_jwt_secret, algorithms=[ALGORITHM])
        return payload.get("sub") == "admin"
    except JWTError:
        return False
