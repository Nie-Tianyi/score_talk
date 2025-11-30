"""
论坛与话题评分系统 - 用户相关数据模式

这个文件定义了用户管理功能中使用的Pydantic数据模式，包括：
1. UserCreate - 用户注册时的输入数据格式
2. UserOut - 用户信息的输出格式（不包含敏感信息）

这些模式用于：
- 验证用户注册和用户信息查询的请求/响应数据
- 自动生成API文档中的用户相关部分
- 确保数据格式的一致性和安全性

设计原则：
- 输入模式（如UserCreate）包含验证规则
- 输出模式（如UserOut）不包含敏感信息（如密码哈希）
- 使用继承来复用公共配置
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, constr

from app.schemas.base import ORMModel


class UserCreate(BaseModel):
    """
    用户创建模式 - 用户注册时的输入数据

    这个模式定义了创建新用户时需要提供的数据格式。
    包含必要的验证规则，确保输入数据的有效性。

    字段说明：
    - username: 用户名，必须唯一，用于登录
    - nickname: 用户昵称，显示给其他用户的名称
    - password: 用户密码，使用constr确保最小长度为6个字符
    - role: 用户角色，可选字段，默认为"user"

    验证规则：
    - 用户名和昵称不能为空
    - 密码长度至少6个字符
    - 角色只能是预定义的值（如"user"、"admin"）

    Example Request:
        {
            "username": "john_doe",
            "nickname": "John Doe",
            "password": "secure123",
            "role": "user"
        }
    """

    username: str
    nickname: str
    password: constr(min_length=6)
    role: Optional[str] = "user"


class UserOut(ORMModel):
    """
    用户输出模式 - 用户信息的响应格式

    这个模式定义了返回给客户端的用户信息格式。
    继承自ORMModel，支持从SQLAlchemy对象自动转换。
    不包含敏感信息（如密码哈希）。

    字段说明：
    - user_id: 用户的唯一标识符，由系统自动生成
    - username: 用户名，用于登录的唯一标识
    - nickname: 用户昵称，显示给其他用户的友好名称
    - role: 用户角色，用于权限控制（"user"或"admin"）
    - created_at: 账户创建时间，自动记录

    安全考虑：
    - 不返回密码哈希等敏感信息
    - 只返回必要的用户信息
    - 支持从数据库对象自动序列化

    Example Response:
        {
            "user_id": 1,
            "username": "john_doe",
            "nickname": "John Doe",
            "role": "user",
            "created_at": "2024-01-01T00:00:00"
        }
    """

    username: str
    nickname: str
    user_id: int
    role: str
    created_at: datetime
