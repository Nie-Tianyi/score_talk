from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import ORMModel


class PostCreate(BaseModel):
    title: str
    content: str


class PostOut(ORMModel):
    post_id: int
    author_id: int
    title: str
    content: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
