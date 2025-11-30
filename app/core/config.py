"""
论坛与话题评分系统 - 应用配置文件

这个文件定义了应用程序的所有配置设置，使用Pydantic Settings进行配置管理。
Pydantic Settings提供了类型安全的环境变量管理和配置验证。

配置可以来自：
1. 环境变量
2. .env文件
3. 代码中的默认值
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    应用配置类

    这个类定义了所有应用需要的配置项，包括：
    - 数据库连接
    - 安全设置
    - 应用元数据

    每个配置项都有默认值，但可以通过环境变量或.env文件覆盖。
    """

    # 项目名称，用于API文档显示
    PROJECT_NAME: str = "Forum & Topic Rating API"

    # 数据库连接字符串
    # SQLALCHEMY_DATABASE_URI格式：数据库类型://用户名:密码@主机:端口/数据库名
    # 这里使用SQLite数据库，数据存储在项目根目录的app.db文件中
    SQLALCHEMY_DATABASE_URI: str = (
        "sqlite:///./app.db"
    )

    # JWT令牌加密密钥
    # 重要：在生产环境中必须通过环境变量设置一个强密钥
    # 这个密钥用于签名和验证JWT令牌
    SECRET_KEY: str = "CHANGE_ME_IN_ENV"

    # 访问令牌过期时间（分钟）
    # 用户登录后获得的JWT令牌的有效期
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24小时

    # JWT令牌签名算法
    # HS256是HMAC使用SHA-256的对称加密算法
    ALGORITHM: str = "HS256"

    # Pydantic配置模型
    # 定义如何加载和验证配置
    model_config = SettingsConfigDict(
        # 从.env文件加载环境变量
        env_file=".env",
        # 环境变量名称区分大小写
        case_sensitive=True,
    )


# 创建全局配置实例
# 这个实例会在整个应用中使用，提供统一的配置访问
settings = Settings()
