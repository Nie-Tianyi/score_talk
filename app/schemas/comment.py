from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import ORMModel


class CommentCreate(BaseModel):
    post_id: int
    content: str


class CommentOut(ORMModel):
    comment_id: int
    post_id: int
    author_id: int
    content: str
    is_deleted: bool
    created_at: datetime
