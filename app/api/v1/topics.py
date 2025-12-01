"""
论坛与话题评分系统 - 话题管理API

这个文件处理话题相关的API端点，包括：
1. 创建话题 - 管理员功能，创建新的评分话题
2. 获取话题列表 - 返回所有可用话题（支持分页）
3. 获取单个话题 - 返回特定话题的详细信息
4. 获取话题统计 - 返回话题的评分统计信息（平均分、评分数量）
5. 对话题评分 - 用户对话题进行评分或更新评分
6. 获取话题评分列表 - 返回特定话题的所有评分记录（支持分页）

权限控制：
- 创建话题：需要管理员权限
- 获取话题列表和详情：公开访问（无需认证）
- 获取话题统计：公开访问（无需认证）
- 对话题评分：需要用户认证，每个用户对每个话题只能评分一次
- 获取评分列表：公开访问（无需认证）

设计特点：
- 话题名称必须唯一，防止重复
- 评分范围限制在1-5分
- 每个用户对每个话题只能评分一次（可更新）
- 支持评分时的可选评论
- 自动计算话题的平均评分和评分数量
- 所有列表查询都支持分页功能
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

# 导入项目中的依赖和工具函数
from app.api.deps import get_current_admin, get_current_user, get_db  # 依赖注入函数
from app.models.models import Rating, Topic, User  # 数据模型

# 导入分页相关模式
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.schemas.rating import RatingCreate, RatingOut  # 评分相关模式
from app.schemas.topic import TopicCreate, TopicOut, TopicStats  # 话题相关模式

# 创建话题相关的API路由器
# prefix="/topics": 所有路由都会以/api/v1/topics开头
# tags=["topics"]: 在API文档中将这个路由器的所有端点分组到"topics"标签下
router = APIRouter(prefix="/topics", tags=["topics"])


@router.post("/", response_model=TopicOut, status_code=201)
def create_topic(
    topic_in: TopicCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    创建新话题端点（管理员功能）

    这个端点允许管理员创建新的评分话题。
    话题名称必须唯一，防止创建重复的话题。

    工作流程：
    1. 验证当前用户是否为管理员
    2. 检查话题名称是否已存在
    3. 创建新话题记录
    4. 返回创建的话题信息

    Args:
        topic_in: 话题创建信息，包含名称和描述
        db: 数据库会话，用于执行数据库操作
        admin: 通过依赖注入验证的管理员用户对象

    Returns:
        TopicOut: 创建成功的话题信息

    Raises:
        HTTPException:
            - 400: 当话题名称已存在时
            - 403: 当用户不是管理员时

    Example Request:
        POST /api/v1/topics/
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        {
            "name": "Python Programming",
            "description": "Discussion about Python programming language"
        }

    Example Response:
        {
            "topic_id": 1,
            "name": "Python Programming",
            "description": "Discussion about Python programming language",
            "created_at": "2024-01-01T00:00:00"
        }
    """
    # 检查话题名称是否已存在
    # 查询数据库中是否已存在相同名称的话题
    exists = db.query(Topic).filter(Topic.name == topic_in.name).first()
    if exists:
        # 如果话题名称已存在，返回400错误
        # 这是为了防止话题名称冲突
        raise HTTPException(status_code=400, detail="Topic already exists")

    # 创建新话题对象
    # 使用TopicCreate模式中的数据初始化话题对象
    topic = Topic(
        name=topic_in.name,  # 话题名称
        description=topic_in.description,  # 话题描述（可选）
    )

    # 将新话题添加到数据库会话
    db.add(topic)
    # 提交事务，将话题保存到数据库
    db.commit()
    # 刷新对象，从数据库加载生成的主键和其他默认值
    db.refresh(topic)

    # 返回创建的话题信息
    return topic


@router.get("/", response_model=PaginatedResponse[TopicOut])
def list_topics(
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
):
    """
    获取话题列表端点（支持分页）

    这个端点返回系统中所有可用话题的列表。
    按创建时间倒序排列，最新的话题显示在前面。
    支持分页查询，可以控制每页显示的数量和当前页码。

    工作流程：
    1. 计算分页偏移量
    2. 查询数据库获取话题总数
    3. 查询当前页的话题数据
    4. 计算分页元数据
    5. 返回分页响应

    Args:
        pagination: 分页参数，包含页码和每页数量
        db: 数据库会话，用于执行查询操作

    Returns:
        PaginatedResponse[TopicOut]: 包含分页元数据和话题列表的响应

    Example Request:
        GET /api/v1/topics/?page=2&per_page=10

    Example Response:
        {
            "items": [
                {
                    "topic_id": 20,
                    "name": "话题名称20",
                    "description": "话题描述...",
                    "created_at": "2024-01-20T00:00:00"
                },
                {
                    "topic_id": 19,
                    "name": "话题名称19",
                    "description": "话题描述...",
                    "created_at": "2024-01-19T00:00:00"
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
        - 结果按创建时间倒序排列，最新的在前
        - 支持分页查询，默认每页20条，最大100条
    """
    # 计算分页偏移量
    offset = (pagination.page - 1) * pagination.per_page

    # 查询话题总数
    total = db.query(func.count(Topic.topic_id)).scalar()

    # 查询当前页的话题数据
    topics = (
        db.query(Topic)
        .order_by(Topic.created_at.desc())
        .offset(offset)
        .limit(pagination.per_page)
        .all()
    )

    # 计算总页数
    total_pages = (total + pagination.per_page - 1) // pagination.per_page

    # 构建分页响应
    return PaginatedResponse[TopicOut](
        items=topics,
        total=total,
        page=pagination.page,
        per_page=pagination.per_page,
        total_pages=total_pages,
        has_prev=pagination.page > 1,
        has_next=pagination.page < total_pages,
    )


@router.get("/{topic_id}", response_model=TopicOut)
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    """
    获取单个话题详情端点

    这个端点返回特定话题的详细信息。
    如果话题不存在，返回404错误。

    工作流程：
    1. 根据话题ID查询数据库
    2. 如果话题不存在，返回404错误
    3. 返回话题详细信息

    Args:
        topic_id: 话题的唯一标识符（路径参数）
        db: 数据库会话，用于执行查询操作

    Returns:
        TopicOut: 话题的详细信息

    Raises:
        HTTPException: 当话题不存在时返回404错误

    Example Request:
        GET /api/v1/topics/1

    Example Response:
        {
            "topic_id": 1,
            "name": "Python Programming",
            "description": "Discussion about Python programming language",
            "created_at": "2024-01-01T00:00:00"
        }
    """
    # 根据话题ID查询数据库
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        # 如果话题不存在，返回404错误
        raise HTTPException(status_code=404, detail="Topic not found")

    # 返回找到的话题信息
    return topic


@router.get("/{topic_id}/stats", response_model=TopicStats)
def get_topic_stats(topic_id: int, db: Session = Depends(get_db)):
    """
    获取话题评分统计端点

    这个端点返回特定话题的评分统计信息，包括：
    - 平均评分
    - 评分总数

    工作流程：
    1. 验证话题是否存在
    2. 使用SQL聚合函数计算平均分和评分数量
    3. 返回统计信息

    Args:
        topic_id: 话题的唯一标识符（路径参数）
        db: 数据库会话，用于执行查询操作

    Returns:
        TopicStats: 包含话题统计信息的对象

    Raises:
        HTTPException: 当话题不存在时返回404错误

    Example Request:
        GET /api/v1/topics/1/stats

    Example Response:
        {
            "topic_id": 1,
            "avg_score": 4.2,
            "rating_count": 15
        }

    Note:
        - 如果话题还没有任何评分，avg_score会是None
        - 这个端点是公开的，不需要认证
    """
    # 首先验证话题是否存在
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # 使用SQL聚合函数计算平均分和评分数量
    # func.avg(Rating.score): 计算评分的平均值
    # func.count(Rating.rating_id): 计算评分的总数
    # filter(Rating.topic_id == topic_id): 只统计当前话题的评分
    # .one(): 返回单个结果元组
    avg_score, count = (
        db.query(
            func.avg(Rating.score),
            func.count(Rating.rating_id),
        )
        .filter(Rating.topic_id == topic_id)
        .one()
    )

    # 返回统计信息
    # 如果还没有评分，avg_score会是None，需要处理这种情况
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
    """
    对话题进行评分端点

    这个端点允许认证用户对特定话题进行评分。
    每个用户对每个话题只能评分一次，如果已经评过分，则更新原有评分。

    工作流程：
    1. 验证话题ID的一致性（防止URL参数和请求体不一致）
    2. 验证话题是否存在
    3. 检查用户是否已经对该话题评过分
    4. 如果已评分，更新原有评分；否则创建新评分
    5. 保存到数据库并返回评分信息

    Args:
        topic_id: 话题的唯一标识符（路径参数）
        rating_in: 评分信息，包含评分值和可选评论
        db: 数据库会话，用于执行数据库操作
        current_user: 当前认证用户对象

    Returns:
        RatingOut: 创建或更新后的评分信息

    Raises:
        HTTPException:
            - 400: 当话题ID不匹配或话题不存在时
            - 404: 当话题不存在时

    Example Request:
        POST /api/v1/topics/1/ratings
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        {
            "topic_id": 1,
            "score": 5,
            "comment": "Excellent topic for discussion!"
        }

    Example Response:
        {
            "rating_id": 1,
            "user_id": 1,
            "topic_id": 1,
            "score": 5,
            "comment": "Excellent topic for discussion!",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }

    Design Notes:
        - 每个用户对每个话题只能有一个评分（通过数据库唯一约束保证）
        - 支持更新评分，更新时会保留原始创建时间
        - 评分值必须在1-5之间（通过数据库检查约束保证）
    """
    # 验证话题ID的一致性
    # 防止URL中的topic_id和请求体中的topic_id不一致
    if topic_id != rating_in.topic_id:
        raise HTTPException(status_code=400, detail="Topic id mismatch")

    # 验证话题是否存在
    topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # 检查用户是否已经对该话题评过分
    # 查询当前用户对当前话题的现有评分
    rating = (
        db.query(Rating)
        .filter(
            Rating.topic_id == topic_id,
            Rating.user_id == current_user.user_id,
        )
        .first()
    )

    if rating:
        # 如果已经评过分，更新原有评分
        # 更新评分值和评论
        rating.score = rating_in.score
        rating.comment = rating_in.comment
    else:
        # 如果还没有评过分，创建新评分
        rating = Rating(
            topic_id=topic_id,
            user_id=current_user.user_id,
            score=rating_in.score,
            comment=rating_in.comment,
        )
        # 将新评分添加到数据库会话
        db.add(rating)

    # 提交事务，保存评分到数据库
    db.commit()
    # 刷新对象，从数据库加载生成的主键和更新时间
    db.refresh(rating)

    # 返回评分信息
    return rating


@router.get("/{topic_id}/ratings", response_model=PaginatedResponse[RatingOut])
def list_ratings(
    topic_id: int,
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
):
    """
    获取话题评分列表端点（支持分页）

    这个端点返回特定话题的所有评分记录。
    按评分时间倒序排列，最新的评分显示在前面。
    支持分页查询，可以控制每页显示的数量和当前页码。

    工作流程：
    1. 计算分页偏移量
    2. 查询指定话题的评分总数
    3. 查询当前页的评分数据
    4. 计算分页元数据
    5. 返回分页响应

    Args:
        topic_id: 话题的唯一标识符（路径参数）
        pagination: 分页参数，包含页码和每页数量
        db: 数据库会话，用于执行查询操作

    Returns:
        PaginatedResponse[RatingOut]: 包含分页元数据和评分列表的响应

    Example Request:
        GET /api/v1/topics/1/ratings/?page=1&per_page=10

    Example Response:
        {
            "items": [
                {
                    "rating_id": 3,
                    "user_id": 3,
                    "topic_id": 1,
                    "score": 4,
                    "comment": "Good topic",
                    "created_at": "2024-01-03T00:00:00",
                    "updated_at": "2024-01-03T00:00:00"
                },
                {
                    "rating_id": 2,
                    "user_id": 2,
                    "topic_id": 1,
                    "score": 5,
                    "comment": "Excellent!",
                    "created_at": "2024-01-02T00:00:00",
                    "updated_at": "2024-01-02T00:00:00"
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
        - 结果按创建时间倒序排列，最新的在前
        - 返回的评分信息包含用户ID，但不包含用户详细信息
        - 支持分页查询，默认每页20条，最大100条
    """
    # 计算分页偏移量
    offset = (pagination.page - 1) * pagination.per_page

    # 查询指定话题的评分总数
    total = (
        db.query(func.count(Rating.rating_id))
        .filter(Rating.topic_id == topic_id)
        .scalar()
    )

    # 查询当前页的评分数据
    ratings = (
        db.query(Rating)
        .filter(Rating.topic_id == topic_id)
        .order_by(Rating.created_at.desc())
        .offset(offset)
        .limit(pagination.per_page)
        .all()
    )

    # 计算总页数
    total_pages = (total + pagination.per_page - 1) // pagination.per_page

    # 构建分页响应
    return PaginatedResponse[RatingOut](
        items=ratings,
        total=total,
        page=pagination.page,
        per_page=pagination.per_page,
        total_pages=total_pages,
        has_prev=pagination.page > 1,
        has_next=pagination.page < total_pages,
    )
