"""
论坛与话题评分系统 - 评分相关数据模式

这个文件定义了评分功能中使用的Pydantic数据模式，包括：
1. RatingCreate - 创建新评分时的输入数据格式
2. RatingOut - 评分信息的输出格式

这些模式用于：
- 验证评分创建和查询的请求/响应数据
- 自动生成API文档中的评分相关部分
- 确保评分数据的完整性和有效性

设计特点：
- 评分值限制在1-5之间
- 支持可选的评分评论
- 自动记录创建和更新时间
- 每个用户对每个话题只能有一个评分
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class RatingCreate(BaseModel):
    """
    评分创建模式 - 创建新评分时的输入数据

    这个模式定义了用户对话题进行评分时需要提供的数据格式。
    包含严格的验证规则，确保评分数据的有效性。

    字段说明：
    - topic_id: 被评分的话题ID，必须与URL中的话题ID一致
    - score: 评分值，使用Field验证确保在1-5之间
    - comment: 评分评论，可选字段，提供评分的详细说明

    验证规则：
    - topic_id必须与URL参数一致，防止数据不一致
    - score必须在1-5之间（包含1和5）
    - comment可以为空，最大长度255个字符

    Example Request:
        {
            "topic_id": 1,
            "score": 5,
            "comment": "Excellent topic for discussion!"
        }

    Design Notes:
        - 每个用户对每个话题只能有一个评分（通过数据库唯一约束保证）
        - 如果用户已经对话题评过分，这个请求会更新原有评分
        - 评分更新时会保留原始创建时间，只更新分数和评论
    """

    topic_id: int
    score: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class RatingOut(ORMModel):
    """
    评分输出模式 - 评分信息的响应格式

    这个模式定义了返回给客户端的评分信息格式。
    继承自ORMModel，支持从SQLAlchemy对象自动转换。
    包含评分的完整信息和相关的时间戳。

    字段说明：
    - rating_id: 评分的唯一标识符，由系统自动生成
    - user_id: 进行评分的用户ID
    - topic_id: 被评分的话题ID
    - score: 评分值，1-5分
    - comment: 评分评论，用户提供的详细说明（可选）
    - created_at: 评分创建时间，首次评分时记录
    - updated_at: 评分最后更新时间，评分被修改时更新

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

    Usage:
        - 用于评分创建后的响应
        - 用于评分列表查询
        - 用于评分更新后的响应

    Note:
        - 创建时间和更新时间可以帮助追踪评分的修改历史
        - 如果评分从未被修改过，created_at和updated_at的值相同
    """

    rating_id: int
    user_id: int
    topic_id: int
    score: int
    comment: Optional[str]
    created_at: datetime
    updated_at: datetime
