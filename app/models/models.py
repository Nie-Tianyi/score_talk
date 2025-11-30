from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean,
    ForeignKey, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "User"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "Topic"

    topic_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    ratings = relationship("Rating", back_populates="topic", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "Post"

    post_id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("User.user_id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow,
        onupdate=datetime.utcnow, nullable=False
    )

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "Comment"

    comment_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("Post.post_id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("User.user_id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")


class Rating(Base):
    __tablename__ = "Rating"

    rating_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.user_id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("Topic.topic_id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    comment = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow,
        onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="ratings")
    topic = relationship("Topic", back_populates="ratings")

    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="uq_rating_user_topic"),
        CheckConstraint("score BETWEEN 1 AND 5", name="ck_rating_score"),
    )
