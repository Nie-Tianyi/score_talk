from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_admin
from app.models.models import Post, Comment, User
from app.schemas.post import PostCreate, PostOut
from app.schemas.comment import CommentCreate, CommentOut

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=PostOut, status_code=201)
def create_post(
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = Post(
        author_id=current_user.user_id,
        title=post_in.title,
        content=post_in.content,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/", response_model=List[PostOut])
def list_posts(db: Session = Depends(get_db)):
    posts = (
        db.query(Post)
        .filter(Post.is_deleted.is_(False))
        .order_by(Post.created_at.desc())
        .all()
    )
    return posts


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = (
        db.query(Post)
        .filter(Post.post_id == post_id, Post.is_deleted.is_(False))
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 作者自己或管理员才能删
    if current_user.role != "admin" and post.author_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    post.is_deleted = True
    db.commit()
    return


# ----- 评论 -----

@router.post("/{post_id}/comments", response_model=CommentOut, status_code=201)
def create_comment(
    post_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.post_id == post_id, Post.is_deleted.is_(False)).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        author_id=current_user.user_id,
        content=comment_in.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/{post_id}/comments", response_model=List[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id, Comment.is_deleted.is_(False))
        .order_by(Comment.created_at.asc())
        .all()
    )
    return comments
