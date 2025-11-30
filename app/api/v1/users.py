from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_admin
from app.models.models import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(User).all()
