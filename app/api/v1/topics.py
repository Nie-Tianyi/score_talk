from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user, get_current_admin
from app.models.models import Topic, Rating, User
from app.schemas.topic import TopicCreate, TopicOut, TopicStats
from app.schemas.rating import RatingCreate, RatingOut

router = APIRouter(prefix="/topics", tags=["topics"])


@router.post("/", response_model=TopicOut, status_code=201)
def create_topic(
    topic_in: TopicCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    exists = db.query(Topic).filter(Topic.name == topic_in.name).first()
    if exists:
        raise HTTPException(status_code=400, detail="Topic already exists")

    topic = Topic(
        name=topic_in.name,
        description=topic_in.description,
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.get("/", response_model=List[TopicOut])
def list_topics(db: Session = Depends(get_db)):
    return db.query(Topic).order_by(Topic.created_at.desc()).all()


@router.get("/{topic_id}", response_model=TopicOut)
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


@router.get("/{topic_id}/stats", response_model=TopicStats)
def get_topic_stats(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    avg_score, count = db.query(
        func.avg(Rating.score),
        func.count(Rating.rating_id),
    ).filter(Rating.topic_id == topic_id).one()

    return TopicStats(
        topic_id=topic_id,
        avg_score=float(avg_score) if avg_score is not None else None,
        rating_count=count,
    )


@router.post("/{topic_id}/ratings", response_model=RatingOut, status_code=201)
def rate_topic(
    topic_id: int,
    rating_in: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if topic_id != rating_in.topic_id:
        # 防止乱传
        raise HTTPException(status_code=400, detail="Topic id mismatch")

    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    rating = (
        db.query(Rating)
        .filter(
            Rating.topic_id == topic_id,
            Rating.user_id == current_user.user_id,
        )
        .first()
    )

    if rating:
        # 更新评分
        rating.score = rating_in.score
        rating.comment = rating_in.comment
    else:
        rating = Rating(
            topic_id=topic_id,
            user_id=current_user.user_id,
            score=rating_in.score,
            comment=rating_in.comment,
        )
        db.add(rating)

    db.commit()
    db.refresh(rating)
    return rating


@router.get("/{topic_id}/ratings", response_model=List[RatingOut])
def list_ratings(
    topic_id: int,
    db: Session = Depends(get_db),
):
    ratings = (
        db.query(Rating)
        .filter(Rating.topic_id == topic_id)
        .order_by(Rating.created_at.desc())
        .all()
    )
    return ratings
