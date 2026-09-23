# Admin password login that returns a short-lived JWT.
# 管理端密码登录，返回短时有效 JWT。
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.infrastructure.auth.jwt import create_admin_token
from app.infrastructure.config.settings import get_settings

router = APIRouter(prefix="/api/admin", tags=["admin-auth"])


class LoginRequest(BaseModel):
    password: str = Field(min_length=1)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
def admin_login(payload: LoginRequest) -> LoginResponse:
    settings = get_settings()
    if payload.password != settings.admin_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    return LoginResponse(access_token=create_admin_token())
