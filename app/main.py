from fastapi import FastAPI

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# 创建表
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router)


@app.get("/")
def health_check():
    return {"status": "ok"}
