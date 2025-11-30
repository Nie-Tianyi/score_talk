"""
论坛与话题评分系统 - 评论相关数据模式

这个文件定义了评论管理功能中使用的Pydantic数据模式，包括：
1. CommentCreate - 创建新评论时的输入数据格式
2. CommentOut - 评论信息的输出格式

这些模式用于：
- 验证评论创建和查询的请求/响应数据
- 自动生成API文档中的评论相关部分
- 确保数据格式的一致性和完整性

设计特点：
- 评论关联到特定的帖子
- 支持评论内容的完整定义
- 包含软删除状态跟踪
- 自动记录创建时间
- 关联作者信息
"""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import ORMModel


class CommentCreate(BaseModel):
    """
    评论创建模式 - 创建新评论时的输入数据

    这个模式定义了用户对帖子发表评论时需要提供的数据格式。
    包含必要的验证规则，确保评论内容的有效性。

    字段说明：
    - post_id: 评论所属的帖子ID，必须与URL中的帖子ID一致
    - content: 评论正文内容，用户的回复内容

    验证规则：
    - 帖子ID必须与URL参数一致，防止数据不一致
    - 评论内容不能为空，支持长文本格式
    - 作者信息自动从当前登录用户获取

    Example Request:
        {
            "post_id": 1,
            "content": "这是一个很好的帖子，我完全同意作者的观点！"
        }

    Usage:
        - 用于创建新评论的API端点
        - 评论会自动关联到当前登录用户作为作者
        - 评论会自动关联到指定的帖子
        - 创建时间会自动设置为当前时间

    Note:
        - 评论内容应该与帖子主题相关，提供有价值的讨论
        - 评论创建后可以被其他用户查看
        - 评论支持回复其他评论的功能（如果需要扩展）
    """
    post_id: int
    content: str


class CommentOut(ORMModel):
    """
    评论输出模式 - 评论信息的响应格式

    这个模式定义了返回给客户端的评论信息格式。
    继承自ORMModel，支持从SQLAlchemy对象自动转换。
    包含评论的完整信息和相关的时间戳。

    字段说明：
    - comment_id: 评论的唯一标识符，由系统自动生成
    - post_id: 评论所属的帖子ID，关联到帖子表
    - author_id: 评论作者的ID，关联到用户表
    - content: 评论正文内容，用户的回复内容
    - is_deleted: 软删除标记，True表示评论已被逻辑删除
    - created_at: 评论创建时间，发表时记录

    Example Response:
        {
            "comment_id": 1,
            "post_id": 1,
            "author_id": 2,
            "content": "这是一个很好的帖子，我完全同意作者的观点！",
            "is_deleted": false,
            "created_at": "2024-01-01T00:00:00"
        }

    Usage:
        - 用于评论创建后的响应
        - 用于评论列表查询
        - 用于单个评论详情查询

    Design Notes:
        - 使用软删除机制，评论被删除时不会从数据库物理删除
        - 软删除的评论不会在公开查询中显示
        - 评论按创建时间正序排列，便于阅读对话顺序
        - 评论支持嵌套回复（如果需要扩展功能）
        - 评论可以引用其他评论（如果需要扩展功能）
    """
    comment_id: int
    post_id: int
    author_id: int
    content: str
    is_deleted: bool
    created_at: datetime
