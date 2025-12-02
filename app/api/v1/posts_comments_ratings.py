"""
论坛与话题评分系统 - 帖子和评论管理API

这个文件处理论坛功能相关的API端点，包括：
1. 帖子管理 - 创建、查看、删除帖子
2. 评论管理 - 对帖子发表评论、查看帖子评论

权限控制：
- 创建帖子：需要用户认证，任何登录用户都可以创建帖子
- 查看帖子列表和详情：公开访问（无需认证）
- 删除帖子：需要用户认证，只有帖子作者或管理员可以删除
- 发表评论：需要用户认证，任何登录用户都可以对帖子发表评论
- 查看评论：公开访问（无需认证）

设计特点：
- 软删除机制：帖子被删除时不会从数据库物理删除，而是标记为已删除
- 逻辑删除：通过is_deleted字段控制显示状态
- 权限验证：确保用户只能删除自己的帖子（管理员可以删除任何帖子）
- 时间戳跟踪：自动记录创建时间和更新时间
- 分页支持：所有列表查询都支持分页功能
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

# 导入项目中的依赖和工具函数
from app.api.deps import get_current_admin, get_current_user, get_db  # 依赖注入函数
from app.models.models import Comment, Post, User  # 数据模型
from app.schemas.comment import CommentCreate, CommentOut  # 评论相关模式
from app.schemas.pagination import PaginatedResponse, PaginationParams  # 分页相关模式
from app.schemas.post import PostCreate, PostOut  # 帖子相关模式

# 创建帖子和评论相关的API路由器
# prefix="/posts": 所有路由都会以/api/v1/posts开头
# tags=["posts"]: 在API文档中将这个路由器的所有端点分组到"posts"标签下
router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=PostOut, status_code=201)
def create_post(
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    创建新帖子端点

    这个端点允许认证用户创建新的论坛帖子。
    帖子会自动关联到当前登录用户作为作者。

    工作流程：
    1. 验证用户认证状态
    2. 创建新帖子对象，关联当前用户ID
    3. 保存帖子到数据库
    4. 返回创建的帖子信息

    Args:
        post_in: 帖子创建信息，包含标题和内容
        db: 数据库会话，用于执行数据库操作
        current_user: 当前认证用户对象

    Returns:
        PostOut: 创建成功的帖子信息

    Example Request:
        POST /api/v1/posts/
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        {
            "title": "我的第一个帖子",
            "content": "这是帖子的正文内容..."
        }

    Example Response:
        {
            "post_id": 1,
            "author_id": 1,
            "title": "我的第一个帖子",
            "content": "这是帖子的正文内容...",
            "is_deleted": false,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }

    Security Notes:
        - 需要有效的JWT访问令牌
        - 帖子会自动关联到当前登录用户
    """
    # 创建新帖子对象
    # 使用PostCreate模式中的数据初始化帖子对象
    # 自动设置作者为当前登录用户
    post = Post(
        author_id=current_user.user_id,  # 设置作者为当前用户
        title=post_in.title,  # 帖子标题
        content=post_in.content,  # 帖子正文内容
    )

    # 将新帖子添加到数据库会话
    db.add(post)
    # 提交事务，将帖子保存到数据库
    db.commit()
    # 刷新对象，从数据库加载生成的主键和其他默认值
    db.refresh(post)

    # 返回创建的帖子信息
    return post


@router.get("/", response_model=PaginatedResponse[PostOut])
def list_posts(
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
):
    """
    获取帖子列表端点（支持分页）

    这个端点返回论坛中所有未被删除的帖子列表。
    按创建时间倒序排列，最新的帖子显示在前面。
    支持分页查询，可以控制每页显示的数量和当前页码。

    工作流程：
    1. 计算分页偏移量
    2. 查询数据库获取未被删除的帖子总数
    3. 查询当前页的帖子数据
    4. 计算分页元数据
    5. 返回分页响应

    Args:
        pagination: 分页参数，包含页码和每页数量
        db: 数据库会话，用于执行查询操作

    Returns:
        PaginatedResponse[PostOut]: 包含分页元数据和帖子列表的响应

    Example Request:
        GET /api/v1/posts/?page=2&per_page=10

    Example Response:
        {
            "items": [
                {
                    "post_id": 20,
                    "author_id": 5,
                    "title": "帖子标题20",
                    "content": "帖子内容...",
                    "is_deleted": false,
                    "created_at": "2024-01-20T00:00:00",
                    "updated_at": "2024-01-20T00:00:00"
                },
                {
                    "post_id": 19,
                    "author_id": 3,
                    "title": "帖子标题19",
                    "content": "帖子内容...",
                    "is_deleted": false,
                    "created_at": "2024-01-19T00:00:00",
                    "updated_at": "2024-01-19T00:00:00"
                }
            ],
            "total": 50,
            "page": 2,
            "per_page": 10,
            "total_pages": 5,
            "has_prev": true,
            "has_next": true
        }

    Note:
        - 这个端点是公开的，不需要认证
        - 只返回未被删除的帖子（is_deleted = False）
        - 结果按创建时间倒序排列，最新的在前
        - 支持分页查询，默认每页20条，最大100条
    """
    # 计算分页偏移量
    offset = (pagination.page - 1) * pagination.per_page

    # 查询未被删除的帖子总数
    total = (
        db.query(func.count(Post.post_id)).filter(Post.is_deleted.is_(False)).scalar()
    )

    # 查询当前页的帖子数据
    posts = (
        db.query(Post)
        .filter(Post.is_deleted.is_(False))
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(pagination.per_page)
        .all()
    )

    # 计算总页数
    total_pages = (total + pagination.per_page - 1) // pagination.per_page

    # 构建分页响应
    return PaginatedResponse[PostOut](
        items=posts,
        total=total,
        page=pagination.page,
        per_page=pagination.per_page,
        total_pages=total_pages,
        has_prev=pagination.page > 1,
        has_next=pagination.page < total_pages,
    )


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """
    获取单个帖子详情端点

    这个端点返回特定帖子的详细信息。
    如果帖子不存在或已被删除，返回404错误。

    工作流程：
    1. 根据帖子ID查询数据库
    2. 验证帖子存在且未被删除
    3. 返回帖子详细信息

    Args:
        post_id: 帖子的唯一标识符（路径参数）
        db: 数据库会话，用于执行查询操作

    Returns:
        PostOut: 帖子的详细信息

    Raises:
        HTTPException: 当帖子不存在或已被删除时返回404错误

    Example Request:
        GET /api/v1/posts/1

    Example Response:
        {
            "post_id": 1,
            "author_id": 1,
            "title": "我的第一个帖子",
            "content": "这是帖子的正文内容...",
            "is_deleted": false,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    """
    # 根据帖子ID查询数据库，只查找未被删除的帖子
    post = (
        db.query(Post)
        .filter(Post.post_id == post_id, Post.is_deleted.is_(False))
        .first()
    )

    # 验证帖子是否存在
    if not post:
        # 如果帖子不存在或已被删除，返回404错误
        raise HTTPException(status_code=404, detail="Post not found")

    # 返回找到的帖子信息
    return post


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    删除帖子端点

    这个端点允许帖子作者或管理员删除帖子。
    使用软删除机制，帖子不会被物理删除，而是标记为已删除。

    工作流程：
    1. 根据帖子ID查询数据库
    2. 验证帖子存在
    3. 验证当前用户有删除权限（作者或管理员）
    4. 将帖子标记为已删除
    5. 保存更改到数据库

    Args:
        post_id: 帖子的唯一标识符（路径参数）
        db: 数据库会话，用于执行数据库操作
        current_user: 当前认证用户对象

    Returns:
        204 No Content: 删除成功，无返回内容

    Raises:
        HTTPException:
            - 404: 当帖子不存在时
            - 403: 当用户没有删除权限时

    Example Request:
        DELETE /api/v1/posts/1
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    Security Notes:
        - 只有帖子作者或管理员可以删除帖子
        - 使用软删除，帖子数据仍然保留在数据库中
    """
    # 根据帖子ID查询数据库（包括已删除的帖子）
    post = db.query(Post).filter(Post.post_id == post_id).first()

    # 验证帖子是否存在
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 验证删除权限
    # 只有帖子作者或管理员可以删除帖子
    if current_user.role != "admin" and post.author_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # 执行软删除：将帖子标记为已删除
    # 使用软删除而不是物理删除，保留数据完整性
    post.is_deleted = True

    # 提交事务，保存删除状态到数据库
    db.commit()

    # 返回204 No Content，表示删除成功
    return


# ----- 评论管理功能 -----


@router.post("/{post_id}/comments", response_model=CommentOut, status_code=201)
def create_comment(
    post_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    创建评论端点

    这个端点允许认证用户对特定帖子发表评论。
    评论会自动关联到当前登录用户作为作者。

    工作流程：
    1. 验证帖子存在且未被删除
    2. 验证用户认证状态
    3. 创建新评论对象，关联当前用户和帖子
    4. 保存评论到数据库
    5. 返回创建的评论信息

    Args:
        post_id: 帖子的唯一标识符（路径参数）
        comment_in: 评论创建信息，包含评论内容
        db: 数据库会话，用于执行数据库操作
        current_user: 当前认证用户对象

    Returns:
        CommentOut: 创建成功的评论信息

    Raises:
        HTTPException: 当帖子不存在或已被删除时返回404错误

    Example Request:
        POST /api/v1/posts/1/comments
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        {
            "content": "这是一个很好的帖子！"
        }

    Example Response:
        {
            "comment_id": 1,
            "post_id": 1,
            "author_id": 2,
            "content": "这是一个很好的帖子！",
            "is_deleted": false,
            "created_at": "2024-01-01T00:00:00"
        }

    Security Notes:
        - 需要有效的JWT访问令牌
        - 评论会自动关联到当前登录用户和指定帖子
    """
    # 首先验证帖子存在且未被删除
    post = (
        db.query(Post)
        .filter(Post.post_id == post_id, Post.is_deleted.is_(False))
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 创建新评论对象
    # 使用CommentCreate模式中的数据初始化评论对象
    # 自动设置作者为当前登录用户，关联到指定帖子
    comment = Comment(
        post_id=post_id,  # 关联到指定帖子
        author_id=current_user.user_id,  # 设置作者为当前用户
        content=comment_in.content,  # 评论内容
    )

    # 将新评论添加到数据库会话
    db.add(comment)
    # 提交事务，将评论保存到数据库
    db.commit()
    # 刷新对象，从数据库加载生成的主键和其他默认值
    db.refresh(comment)

    # 返回创建的评论信息
    return comment


@router.get("/{post_id}/comments", response_model=PaginatedResponse[CommentOut])
def list_comments(
    post_id: int,
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
):
    """
    获取帖子评论列表端点（支持分页）

    这个端点返回特定帖子的所有未被删除的评论列表。
    按创建时间正序排列，最早的评论显示在前面（便于阅读对话）。
    支持分页查询，可以控制每页显示的数量和当前页码。

    工作流程：
    1. 计算分页偏移量
    2. 查询指定帖子的评论总数
    3. 查询当前页的评论数据
    4. 计算分页元数据
    5. 返回分页响应

    Args:
        post_id: 帖子的唯一标识符（路径参数）
        pagination: 分页参数，包含页码和每页数量
        db: 数据库会话，用于执行查询操作

    Returns:
        PaginatedResponse[CommentOut]: 包含分页元数据和评论列表的响应

    Example Request:
        GET /api/v1/posts/1/comments/?page=1&per_page=10

    Example Response:
        {
            "items": [
                {
                    "comment_id": 1,
                    "post_id": 1,
                    "author_id": 2,
                    "content": "第一个评论！",
                    "is_deleted": false,
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "comment_id": 2,
                    "post_id": 1,
                    "author_id": 3,
                    "content": "我同意这个观点",
                    "is_deleted": false,
                    "created_at": "2024-01-01T01:00:00"
                }
            ],
            "total": 25,
            "page": 1,
            "per_page": 10,
            "total_pages": 3,
            "has_prev": false,
            "has_next": true
        }

    Note:
        - 这个端点是公开的，不需要认证
        - 只返回未被删除的评论（is_deleted = False）
        - 结果按创建时间正序排列，最早的在前（便于阅读对话顺序）
        - 支持分页查询，默认每页20条，最大100条
    """
    # 计算分页偏移量
    offset = (pagination.page - 1) * pagination.per_page

    # 查询指定帖子的评论总数
    total = (
        db.query(func.count(Comment.comment_id))
        .filter(Comment.post_id == post_id, Comment.is_deleted.is_(False))
        .scalar()
    )

    # 查询当前页的评论数据
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id, Comment.is_deleted.is_(False))
        .order_by(Comment.created_at.asc())
        .offset(offset)
        .limit(pagination.per_page)
        .all()
    )

    # 计算总页数
    total_pages = (total + pagination.per_page - 1) // pagination.per_page

    # 构建分页响应
    return PaginatedResponse[CommentOut](
        items=comments,
        total=total,
        page=pagination.page,
        per_page=pagination.per_page,
        total_pages=total_pages,
        has_prev=pagination.page > 1,
        has_next=pagination.page < total_pages,
    )


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    删除评论端点

    这个端点允许评论作者或管理员删除评论。
    使用软删除机制，评论不会被物理删除，而是标记为已删除。

    工作流程：
    1. 根据评论ID查询数据库
    2. 验证评论记录是否存在
    3. 验证当前用户有删除权限（评论作者或管理员）
    4. 将评论标记为已删除（软删除）
    5. 提交事务到数据库

    Args:
        comment_id: 评论的唯一标识符（路径参数）
        db: 数据库会话，用于执行数据库操作
        current_user: 当前认证用户对象

    Returns:
        204 No Content: 删除成功，无返回内容

    Raises:
        HTTPException:
            - 404: 当评论记录不存在时
            - 403: 当用户没有删除权限时

    Example Request:
        DELETE /api/v1/posts/comments/1
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    Security Notes:
        - 只有评论作者或管理员可以删除评论
        - 使用软删除机制，评论数据仍然保留在数据库中
    """
    # 根据评论ID查询数据库（包括已删除的评论）
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()

    # 验证评论记录是否存在
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # 验证删除权限
    # 只有评论作者或管理员可以删除评论
    if current_user.role != "admin" and comment.author_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # 执行软删除：将评论标记为已删除
    # 使用软删除而不是物理删除，保留数据完整性
    comment.is_deleted = True

    # 提交事务，保存删除状态到数据库
    db.commit()

    # 返回204 No Content，表示删除成功
    return