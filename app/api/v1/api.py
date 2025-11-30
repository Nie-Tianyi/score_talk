# app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1 import auth, users, topics, posts_comments_ratings

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(topics.router)
api_router.include_router(posts_comments_ratings.router)
