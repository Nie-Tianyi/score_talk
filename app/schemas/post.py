"""
论坛与话题评分系统 - 帖子相关数据模式

这个文件定义了帖子管理功能中使用的Pydantic数据模式，包括：
1. PostCreate - 创建新帖子时的输入数据格式
2. PostOut - 帖子信息的输出格式

这些模式用于：
- 验证帖子创建和查询的请求/响应数据
- 自动生成API文档中的帖子相关部分
- 确保数据格式的一致性和完整性

设计特点：
- 支持帖子标题和内容的完整定义
- 包含软删除状态跟踪
- 自动记录创建和更新时间
- 关联作者信息
"""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import ORMModel


class PostCreate(BaseModel):
    """
    帖子创建模式 - 创建新帖子时的输入数据

    这个模式定义了用户创建新帖子时需要提供的数据格式。
    包含必要的验证规则，确保帖子内容的有效性。

    字段说明：
    - title: 帖子标题，简要概括帖子内容
    - content: 帖子正文内容，支持长文本格式

    验证规则：
    - 标题不能为空，最大长度200个字符
    - 内容不能为空，支持长文本格式
    - 作者信息自动从当前登录用户获取

    Example Request:
        {
            "title": "我的第一个帖子",
            "content": "这是帖子的正文内容，可以包含详细的讨论..."
        }

    Usage:
        - 用于创建新帖子的API端点
        - 帖子会自动关联到当前登录用户作为作者
        - 创建时间会自动设置为当前时间

    Note:
        - 帖子标题应该简洁明了，便于其他用户快速了解内容
        - 帖子内容支持富文本格式，可以包含详细的讨论
        - 帖子创建后可以被其他用户查看和评论
    """
    title: str
    content: str


class PostOut(ORMModel):
    """
    帖子输出模式 - 帖子信息的响应格式

    这个模式定义了返回给客户端的帖子信息格式。
    继承自ORMModel，支持从SQLAlchemy对象自动转换。
    包含帖子的完整信息和相关的时间戳。

    字段说明：
    - post_id: 帖子的唯一标识符，由系统自动生成
    - author_id: 帖子作者的ID，关联到用户表
    - title: 帖子标题，简要概括帖子内容
    - content: 帖子正文内容，完整的讨论内容
    - is_deleted: 软删除标记，True表示帖子已被逻辑删除
    - created_at: 帖子创建时间，首次发布时记录
    - updated_at: 帖子最后更新时间，内容被修改时更新

    Example Response:
        {
            "post_id": 1,
            "author_id": 1,
            "title": "我的第一个帖子",
            "content": "这是帖子的正文内容，可以包含详细的讨论...",
            "is_deleted": false,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }

    Usage:
        - 用于帖子创建后的响应
        - 用于帖子列表查询
        - 用于单个帖子详情查询
        - 用于帖子更新后的响应

    Design Notes:
        - 使用软删除机制，帖子被删除时不会从数据库物理删除
        - 软删除的帖子不会在公开查询中显示
        - 创建时间和更新时间可以帮助追踪帖子的修改历史
        - 如果帖子从未被修改过，created_at和updated_at的值相同
    """
    post_id: int
    author_id: int
    title: str
    content: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
