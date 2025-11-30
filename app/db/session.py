"""
论坛与话题评分系统 - 数据库会话管理

这个文件负责创建和管理数据库连接，包括：
1. 创建数据库引擎（Engine）
2. 创建会话工厂（SessionLocal）
3. 配置数据库连接参数

数据库引擎是SQLAlchemy的核心组件，它：
- 管理数据库连接池
- 处理SQL语句的执行
- 提供事务管理

会话（Session）是数据库操作的主要接口，用于：
- 执行查询
- 添加、更新、删除记录
- 管理事务
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# 创建数据库引擎
# create_engine函数创建数据库连接引擎，这是SQLAlchemy与数据库通信的核心
# 参数说明：
# - settings.SQLALCHEMY_DATABASE_URI: 数据库连接字符串
# - pool_pre_ping=True: 在从连接池获取连接前先检查连接是否有效，避免使用已断开的连接
# - future=True: 使用SQLAlchemy 2.0风格的API，提供更好的性能和功能
# - connect_args: 数据库特定的连接参数
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    future=True,
    # 对于SQLite数据库，需要设置check_same_thread=False
    # 这允许在同一个线程中使用多个连接，适用于开发环境
    # 在生产环境中使用其他数据库（如PostgreSQL、MySQL）时不需要这个参数
    connect_args={"check_same_thread": False}
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite")
    else {},
)

# 创建会话工厂
# sessionmaker是一个工厂类，用于创建Session对象
# 参数说明：
# - autocommit=False: 不自动提交事务，需要显式调用commit()
# - autoflush=False: 不自动刷新会话，需要显式调用flush()
# - bind=engine: 绑定到之前创建的数据库引擎
#
# SessionLocal现在是一个可调用对象，调用它会返回一个新的数据库会话
# 在FastAPI中，我们通常使用依赖注入来管理会话的生命周期
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
