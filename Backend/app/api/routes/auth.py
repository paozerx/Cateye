import jwt
from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlalchemy import select

from app.core.config import settings
from app.core.security import create_access_token, hash_password, read_access_token, verify_password
from app.db.session import DbSession
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])
COOKIE_NAME = "cateye_session"


def set_session_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=create_access_token(user.id),
        max_age=settings.auth_token_minutes * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        path="/api",
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, response: Response, db: DbSession) -> User:
    email = str(data.email).strip().lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="อีเมลนี้มีบัญชีแล้ว")

    display_name = data.display_name.strip()
    if not display_name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="กรุณากรอกชื่อที่ใช้แสดง")
    user = User(email=email, display_name=display_name, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    set_session_cookie(response, user)
    return user


@router.post("/login", response_model=UserResponse)
def login(data: LoginRequest, response: Response, db: DbSession) -> User:
    email = str(data.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    set_session_cookie(response, user)
    return user


@router.get("/me", response_model=UserResponse)
def current_user(request: Request, db: DbSession) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="กรุณาเข้าสู่ระบบ")
    try:
        user_id = read_access_token(token)
    except jwt.InvalidTokenError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่") from error
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ไม่พบบัญชีผู้ใช้")
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> Response:
    response.delete_cookie(key=COOKIE_NAME, path="/api", httponly=True, secure=settings.auth_cookie_secure, samesite="lax")
    return response
