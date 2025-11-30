"""
论坛与话题评分系统 - 话题相关数据模式

这个文件定义了话题管理功能中使用的Pydantic数据模式，包括：
1. TopicCreate - 创建新话题时的输入数据格式
2. TopicOut - 话题信息的输出格式
3. TopicStats - 话题评分统计信息的输出格式

这些模式用于：
- 验证话题创建和查询的请求/响应数据
- 自动生成API文档中的话题相关部分
- 确保数据格式的一致性和完整性

设计特点：
- 话题名称必须唯一，防止重复
- 支持可选的话题描述
- 统计信息包含平均分和评分数量
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.base import ORMModel


class TopicCreate(BaseModel):
    """
    话题创建模式 - 创建新话题时的输入数据

    这个模式定义了管理员创建新话题时需要提供的数据格式。
    用于话题管理API中的创建操作。

    字段说明：
    - name: 话题名称，必须唯一，用于标识话题
    - description: 话题描述，可选字段，提供话题的详细说明

    验证规则：
    - 话题名称不能为空
    - 话题名称在系统中必须唯一
    - 描述可以为空

    Example Request:
        {
            "name": "Python Programming",
            "description": "Discussion about Python programming language"
        }

    Note:
        - 话题名称的唯一性由数据库约束保证
        - 创建话题需要管理员权限
    """

    name: str
    description: Optional[str] = None


class TopicOut(ORMModel):
    """
    话题输出模式 - 话题信息的响应格式

    这个模式定义了返回给客户端的话题信息格式。
    继承自ORMModel，支持从SQLAlchemy对象自动转换。
    包含话题的基本信息和创建时间。

    字段说明：
    - topic_id: 话题的唯一标识符，由系统自动生成
    - name: 话题名称，用于显示和标识
    - description: 话题描述，提供详细说明（可选）
    - created_at: 话题创建时间，自动记录

    Example Response:
        {
            "topic_id": 1,
            "name": "Python Programming",
            "description": "Discussion about Python programming language",
            "created_at": "2024-01-01T00:00:00"
        }

    Usage:
        - 用于话题列表查询
        - 用于单个话题详情查询
        - 用于话题创建后的响应
    """

    topic_id: int
    name: str
    description: Optional[str]
    created_at: datetime


class TopicStats(BaseModel):
    """
    话题统计模式 - 话题评分统计信息的响应格式

    这个模式定义了话题评分统计信息的输出格式。
    用于显示话题的评分概况，包括平均分和评分数量。

    字段说明：
    - topic_id: 话题的唯一标识符
    - avg_score: 平均评分，1-5分的小数值，如果没有评分则为None
    - rating_count: 评分总数，表示有多少用户对该话题进行了评分

    计算方式：
    - 平均分：所有评分的总和除以评分数量
    - 评分数量：该话题的所有评分记录数

    Example Response:
        {
            "topic_id": 1,
            "avg_score": 4.2,
            "rating_count": 15
        }

    Note:
        - 如果话题还没有任何评分，avg_score字段会是None
        - 这个模式通常用于话题详情页面的统计信息显示
        - 统计信息是实时计算的，反映当前的数据状态
    """

    topic_id: int
    avg_score: Optional[float]
    rating_count: int
