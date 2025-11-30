"""
论坛与话题评分系统 - Pydantic 基础模型配置

这个文件定义了所有Pydantic响应模型的基类，用于配置ORM模式支持。
Pydantic是FastAPI中用于数据验证和序列化的核心库。

主要功能：
1. 提供统一的ORM配置，支持从SQLAlchemy模型自动转换
2. 确保响应数据格式的一致性
3. 简化模型定义，避免重复配置

from_attributes=True 配置的作用：
- 允许Pydantic模型从任意对象（包括SQLAlchemy模型实例）创建
- 自动映射对象的属性到Pydantic模型的字段
- 支持嵌套对象的序列化
- 这是FastAPI与SQLAlchemy集成的重要配置

使用示例：
所有需要从数据库模型转换的响应模型都应该继承这个基类。
"""

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """
    ORM兼容的Pydantic基类

    这个基类配置了from_attributes=True，使得Pydantic模型能够：
    - 直接从SQLAlchemy模型实例创建
    - 自动处理关系对象的序列化
    - 支持复杂的嵌套数据结构

    为什么需要这个配置：
    在默认情况下，Pydantic期望输入是字典形式。
    当我们需要从SQLAlchemy对象创建Pydantic模型时，需要启用这个配置。

    示例用法：
    class UserOut(ORMModel):
        user_id: int
        username: str
        # 其他字段...

    然后可以直接这样使用：
    user = db.query(User).first()
    return UserOut.model_validate(user)  # 自动从SQLAlchemy对象转换

    如果没有这个配置，需要手动转换：
    return UserOut(
        user_id=user.user_id,
        username=user.username,
        # 手动映射所有字段...
    )
    """

    # Pydantic配置字典
    # from_attributes=True 是关键配置，允许从对象属性创建模型
    model_config = ConfigDict(from_attributes=True)
