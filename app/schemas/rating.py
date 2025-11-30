from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class RatingCreate(BaseModel):
    topic_id: int
    score: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class RatingOut(ORMModel):
    rating_id: int
    user_id: int
    topic_id: int
    score: int
    comment: Optional[str]
    created_at: datetime
    updated_at: datetime
