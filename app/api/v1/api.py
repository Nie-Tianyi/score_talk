"""
论坛与话题评分系统 - API路由配置

这个文件是API路由的主要配置中心，负责：
1. 创建主API路由器实例
2. 注册所有子路由模块
3. 组织API端点结构

API结构说明：
- 所有API端点都以 /api/v1 开头
- 不同的功能模块使用不同的子路由
- 每个子路由有自己的前缀和标签

路由组织：
- /api/v1/auth/*     - 认证相关端点（注册、登录）
- /api/v1/users/*    - 用户管理端点
- /api/v1/topics/*   - 话题管理端点
- /api/v1/posts/*    - 帖子和评论管理端点

这种模块化设计使得：
- 代码结构清晰，易于维护
- 功能模块独立，便于测试
- API文档自动分组，便于查阅
"""

from fastapi import APIRouter

# 导入各个功能模块的路由器
from app.api.v1 import auth, users, topics, posts_comments_ratings

# 创建主API路由器
# prefix="/api/v1": 所有路由都会以 /api/v1 开头
# 这样设计的优点：
# - 版本控制：便于未来升级到v2等版本
# - 路径清晰：所有API端点都有统一的命名空间
# - 反向代理友好：便于配置负载均衡和API网关
api_router = APIRouter(prefix="/api/v1")

# 注册认证路由模块
# 这个模块处理用户注册和登录功能
# 路由前缀：/api/v1/auth
# API文档标签：auth
api_router.include_router(auth.router)

# 注册用户管理路由模块
# 这个模块处理用户信息查询和管理功能
# 路由前缀：/api/v1/users
# API文档标签：users
api_router.include_router(users.router)

# 注册话题管理路由模块
# 这个模块处理话题的创建、查询和评分功能
# 路由前缀：/api/v1/topics
# API文档标签：topics
api_router.include_router(topics.router)

# 注册帖子和评论管理路由模块
# 这个模块处理论坛帖子和评论的完整功能
# 路由前缀：/api/v1/posts
# API文档标签：posts
api_router.include_router(posts_comments_ratings.router)

# 注意：所有通过 include_router 注册的路由都会自动包含在：
# - 自动生成的API文档中（/docs 和 /redoc）
# - OpenAPI规范中
# - 应用的路由表中
