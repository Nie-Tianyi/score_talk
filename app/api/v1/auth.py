from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.username == user_in.username).first()
    if exists:
        raise HTTPException(status_code=400, detail="Username already registered")

    user = User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        nickname=user_in.nickname,
        role=user_in.role or "user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/token", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(subject=user.user_id)
    return Token(access_token=access_token)
