"""
论坛与话题评分系统 - 分页数据模式

这个文件定义了分页功能中使用的Pydantic数据模式，包括：
1. PaginationParams - 分页查询参数
2. PaginatedResponse - 分页响应格式

这些模式用于：
- 统一分页查询的请求参数格式
- 标准化分页响应的数据结构
- 支持所有列表查询的分页功能

设计特点：
- 支持页码和每页数量的灵活配置
- 包含分页元数据（总数、总页数、当前页等）
- 通用设计，可适用于所有列表查询
"""

from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

# 定义泛型类型，用于表示分页响应中的数据类型
T = TypeVar("T")


class PaginationParams(BaseModel):
    """
    分页查询参数模式 - 分页查询的输入参数

    这个模式定义了分页查询时客户端可以提供的参数。
    包含页码和每页数量，支持默认值和范围限制。

    字段说明：
    - page: 当前页码，从1开始计数，默认值为1
    - per_page: 每页显示的数量，默认值为20，最大不超过100

    验证规则：
    - 页码必须大于等于1
    - 每页数量必须在1-100之间

    Example Request:
        GET /api/v1/posts?page=2&per_page=10

    Usage:
        - 用于所有支持分页的列表查询API端点
        - 客户端可以通过这些参数控制数据的分页显示
        - 服务器端需要验证参数的合法性

    Note:
        - 页码从1开始，符合用户习惯
        - 每页数量限制在100以内，防止查询过大影响性能
        - 如果客户端不提供这些参数，使用默认值
    """

    page: int = Field(default=1, ge=1, description="页码，从1开始")
    per_page: int = Field(default=20, ge=1, le=100, description="每页数量，最大100")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    分页响应模式 - 分页查询的响应格式

    这个模式定义了分页查询返回的数据结构。
    使用泛型设计，可以适用于不同类型的数据列表。

    字段说明：
    - items: 当前页的数据列表
    - total: 数据总数
    - page: 当前页码
    - per_page: 每页数量
    - total_pages: 总页数
    - has_prev: 是否有上一页
    - has_next: 是否有下一页

    Example Response:
        {
            "items": [
                { "post_id": 1, "title": "帖子1", ... },
                { "post_id": 2, "title": "帖子2", ... }
            ],
            "total": 50,
            "page": 2,
            "per_page": 10,
            "total_pages": 5,
            "has_prev": true,
            "has_next": true
        }

    Usage:
        - 用于所有支持分页的列表查询API响应
        - 提供完整的分页导航信息
        - 客户端可以根据这些信息实现分页控件

    Design Notes:
        - 使用泛型设计，可以复用相同的分页结构
        - 包含完整的分页元数据，便于客户端导航
        - 计算总页数时使用向上取整，确保所有数据都能被分页
        - has_prev和has_next字段便于客户端判断是否显示翻页按钮
    """

    items: List[T]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_prev: bool
    has_next: bool
