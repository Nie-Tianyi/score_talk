"""
论坛与话题评分系统 - 用户管理API

这个文件处理用户相关的API端点，包括：
1. 获取当前用户信息 - 返回已认证用户的个人信息
2. 列出所有用户 - 管理员功能，返回系统中所有用户列表（支持分页）

权限控制：
- 获取当前用户信息：需要用户认证，任何登录用户都可以访问
- 列出所有用户：需要管理员权限，只有管理员可以查看所有用户

安全考虑：
- 用户信息不包含敏感数据（如密码哈希）
- 管理员权限验证确保只有授权用户可以访问敏感操作
- 使用依赖注入自动处理认证和授权
- 所有列表查询都支持分页功能
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

# 导入项目中的依赖和工具函数
from app.api.deps import get_current_admin, get_current_user, get_db  # 依赖注入函数
from app.models.models import User  # 用户数据模型
from app.schemas.pagination import PaginatedResponse, PaginationParams  # 分页相关模式
from app.schemas.user import UserOut  # 用户输出模式

# 创建用户相关的API路由器
# prefix="/users": 所有路由都会以/api/v1/users开头
# tags=["users"]: 在API文档中将这个路由器的所有端点分组到"users"标签下
router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    """
    获取当前用户信息端点

    这个端点返回当前已认证用户的个人信息。
    用户通过JWT令牌进行认证，系统会自动识别当前用户。

    工作流程：
    1. 依赖注入系统自动调用get_current_user函数验证JWT令牌
    2. 从令牌中提取用户ID并查询数据库
    3. 返回当前用户的完整信息

    Args:
        current_user: 通过依赖注入获取的当前认证用户对象

    Returns:
        UserOut: 当前用户的详细信息（不包含密码等敏感信息）

    Example Request:
        GET /api/v1/users/me
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    Example Response:
        {
            "user_id": 1,
            "username": "john_doe",
            "nickname": "John Doe",
            "role": "user",
            "created_at": "2024-01-01T00:00:00"
        }

    Security Notes:
        - 需要有效的JWT访问令牌
        - 返回的信息不包含密码哈希等敏感数据
        - 每个用户只能访问自己的信息
    """
    # 直接返回当前用户对象
    # response_model=UserOut确保返回的数据符合输出模式
    # 不会返回密码哈希等敏感字段
    return current_user


@router.get("/", response_model=PaginatedResponse[UserOut])
def list_users(
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    列出所有用户端点（管理员功能，支持分页）

    这个端点返回系统中所有注册用户的列表。
    只有具有管理员权限的用户可以访问此端点。
    支持分页查询，可以控制每页显示的数量和当前页码。

    工作流程：
    1. 依赖注入系统验证当前用户是否为管理员
    2. 如果不是管理员，返回403禁止访问错误
    3. 计算分页偏移量
    4. 查询数据库获取用户总数
    5. 查询当前页的用户数据
    6. 计算分页元数据
    7. 返回分页响应

    Args:
        pagination: 分页参数，包含页码和每页数量
        db: 数据库会话，用于执行查询操作
        admin: 通过依赖注入验证的管理员用户对象

    Returns:
        PaginatedResponse[UserOut]: 包含分页元数据和用户列表的响应

    Raises:
        HTTPException: 当用户不是管理员时返回403错误

    Example Request:
        GET /api/v1/users/?page=2&per_page=10
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    Example Response:
        {
            "items": [
                {
                    "user_id": 20,
                    "username": "user20",
                    "nickname": "用户20",
                    "role": "user",
                    "created_at": "2024-01-20T00:00:00"
                },
                {
                    "user_id": 19,
                    "username": "user19",
                    "nickname": "用户19",
                    "role": "user",
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

    Security Notes:
        - 需要管理员权限才能访问
        - 返回的信息不包含密码哈希等敏感数据
        - 支持分页查询，默认每页20条，最大100条
    """
    # 计算分页偏移量
    offset = (pagination.page - 1) * pagination.per_page

    # 查询用户总数
    total = db.query(func.count(User.user_id)).scalar()

    # 查询当前页的用户数据
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(pagination.per_page)
        .all()
    )

    # 计算总页数
    total_pages = (total + pagination.per_page - 1) // pagination.per_page

    # 构建分页响应
    return PaginatedResponse[UserOut](
        items=users,
        total=total,
        page=pagination.page,
        per_page=pagination.per_page,
        total_pages=total_pages,
        has_prev=pagination.page > 1,
        has_next=pagination.page < total_pages,
    )
