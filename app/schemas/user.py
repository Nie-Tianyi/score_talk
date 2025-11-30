from datetime import datetime
from typing import Optional

from pydantic import BaseModel, constr

from app.schemas.base import ORMModel


class UserCreate(BaseModel):
    username: str
    nickname: str
    password: constr(min_length=6)
    role: Optional[str] = "user"


class UserOut(ORMModel):
    username: str
    nickname: str
    user_id: int
    role: str
    created_at: datetime
