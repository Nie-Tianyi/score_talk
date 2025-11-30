"""
论坛与话题评分系统 - 用户管理API

这个文件处理用户相关的API端点，包括：
1. 获取当前用户信息 - 返回已认证用户的个人信息
2. 列出所有用户 - 管理员功能，返回系统中所有用户列表

权限控制：
- 获取当前用户信息：需要用户认证，任何登录用户都可以访问
- 列出所有用户：需要管理员权限，只有管理员可以查看所有用户

安全考虑：
- 用户信息不包含敏感数据（如密码哈希）
- 管理员权限验证确保只有授权用户可以访问敏感操作
- 使用依赖注入自动处理认证和授权
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# 导入项目中的依赖和工具函数
from app.api.deps import get_db, get_current_user, get_current_admin  # 依赖注入函数
from app.models.models import User  # 用户数据模型
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


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    列出所有用户端点（管理员功能）

    这个端点返回系统中所有注册用户的列表。
    只有具有管理员权限的用户可以访问此端点。

    工作流程：
    1. 依赖注入系统验证当前用户是否为管理员
    2. 如果不是管理员，返回403禁止访问错误
    3. 如果是管理员，查询数据库获取所有用户
    4. 返回用户列表

    Args:
        db: 数据库会话，用于执行查询操作
        admin: 通过依赖注入验证的管理员用户对象

    Returns:
        List[UserOut]: 包含所有用户信息的列表

    Raises:
        HTTPException: 当用户不是管理员时返回403错误

    Example Request:
        GET /api/v1/users/
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    Example Response:
        [
            {
                "user_id": 1,
                "username": "admin_user",
                "nickname": "Administrator",
                "role": "admin",
                "created_at": "2024-01-01T00:00:00"
            },
            {
                "user_id": 2,
                "username": "regular_user",
                "nickname": "Regular User",
                "role": "user",
                "created_at": "2024-01-02T00:00:00"
            }
        ]

    Security Notes:
        - 需要管理员权限才能访问
        - 返回的信息不包含密码哈希等敏感数据
        - 在生产环境中，可能需要分页来防止返回过多数据
    """
    # 查询数据库获取所有用户
    # 使用SQLAlchemy的查询接口获取User表中的所有记录
    # 返回的用户列表会自动通过UserOut模式进行序列化
    return db.query(User).all()
