"""
论坛与话题评分系统 - 主应用程序入口文件

这个文件是FastAPI应用程序的入口点，负责：
1. 初始化FastAPI应用实例
2. 配置数据库表结构
3. 注册所有API路由
4. 提供健康检查端点

FastAPI是一个现代、快速（高性能）的Web框架，用于构建API。
SQLAlchemy是Python中最流行的ORM（对象关系映射）库，用于数据库操作。
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 导入项目中的模块
from app.api.v1.api import api_router  # API路由注册器
from app.core.config import settings  # 应用配置
from app.db.base import Base  # SQLAlchemy基类，用于定义数据模型
from app.db.session import engine  # 数据库引擎，用于连接数据库

# 创建数据库表结构
# 这行代码会扫描所有继承自Base的模型类，并在数据库中创建对应的表
# bind=engine 指定使用哪个数据库连接来创建表
# 在开发环境中，这通常会在应用启动时自动创建表
# 在生产环境中，建议使用数据库迁移工具（如Alembic）来管理表结构变更
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用实例
# title参数设置API文档中显示的标题
# FastAPI会自动生成交互式API文档，可以通过 /docs 和 /redoc 访问
app = FastAPI(title=settings.PROJECT_NAME)

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
# include_router方法将定义在api_router中的所有路由添加到主应用中
# 这些路由会被挂载到/api/v1路径下，形成完整的API端点
app.include_router(api_router)

@app.get("/")
def health_check():
    """
    健康检查端点

    这个简单的端点用于：
    - 验证应用是否正常运行
    - 负载均衡器健康检查
    - 监控系统状态检测

    返回一个简单的JSON响应，表示应用状态正常
    """
    return {"status": "ok"}