from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.base import ORMModel


class TopicCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TopicOut(ORMModel):
    topic_id: int
    name: str
    description: Optional[str]
    created_at: datetime


class TopicStats(BaseModel):
    topic_id: int
    avg_score: Optional[float]
    rating_count: int
