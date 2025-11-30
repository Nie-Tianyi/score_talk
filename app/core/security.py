"""
论坛与话题评分系统 - 安全工具函数

这个文件包含所有与安全相关的工具函数，包括：
1. 密码哈希和验证
2. JWT令牌创建

密码安全：
- 使用bcrypt算法进行密码哈希，这是目前最安全的密码哈希算法之一
- bcrypt会自动处理盐值(salt)生成，防止彩虹表攻击
- 哈希过程是单向的，无法从哈希值反推原始密码

JWT（JSON Web Token）：
- 用于用户认证的无状态令牌
- 包含用户身份信息和过期时间
- 使用HS256算法进行数字签名，确保令牌不被篡改
"""

from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# 创建密码上下文对象
# CryptContext是passlib库的核心类，用于管理密码哈希策略
# schemes=["bcrypt"]: 指定使用bcrypt算法进行密码哈希
# deprecated="auto": 自动标记过时的哈希方法
# bcrypt算法的特点：
# - 计算速度慢，增加暴力破解的难度
# - 自动生成和存储盐值
# - 抵抗彩虹表攻击
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """
    生成密码哈希值

    这个函数接收明文密码，返回安全的哈希值。
    哈希过程是单向的，无法从哈希值恢复原始密码。

    安全特性：
    - 相同的密码每次哈希都会得到不同的结果（因为自动生成的盐值不同）
    - 计算成本高，防止暴力破解
    - 符合现代密码安全标准

    Args:
        password: 用户输入的明文密码

    Returns:
        str: 密码的bcrypt哈希值，格式类似：$2b$12$...

    Example:
        >>> get_password_hash("mypassword123")
        '$2b$12$r8vqQ7J2K5n8M9oP1qR2XeYzA1B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8'
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码是否正确

    这个函数比较用户输入的明文密码与数据库中存储的哈希密码是否匹配。
    它会自动处理bcrypt的盐值和哈希验证。

    工作流程：
    1. 从哈希值中提取盐值
    2. 使用相同的盐值对输入密码进行哈希
    3. 比较两个哈希值是否相同

    Args:
        plain_password: 用户输入的明文密码
        hashed_password: 数据库中存储的密码哈希值

    Returns:
        bool: 如果密码匹配返回True，否则返回False

    Example:
        >>> verify_password("mypassword123", "$2b$12$...")
        True
        >>> verify_password("wrongpassword", "$2b$12$...")
        False
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str | int,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    创建JWT访问令牌

    这个函数生成包含用户身份信息的JWT令牌。
    JWT令牌由三部分组成：头部、负载、签名。

    令牌结构：
    - 头部：指定令牌类型和签名算法
    - 负载：包含用户ID(sub)和过期时间(exp)
    - 签名：使用密钥对头部和负载进行签名，防止篡改

    Args:
        subject: 令牌的主题，通常是用户ID
        expires_delta: 可选的过期时间增量，如果不提供则使用默认设置

    Returns:
        str: 编码后的JWT令牌字符串

    Example:
        >>> create_access_token(123)
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE2...'

    Security Notes:
        - 令牌包含过期时间，防止长期有效的令牌被滥用
        - 使用强密钥进行签名，防止令牌被伪造
        - 令牌通过网络传输，建议始终使用HTTPS
    """
    # 确保subject是字符串类型
    # JWT标准要求所有字段都是字符串
    if isinstance(subject, int):
        subject = str(subject)

    # 准备要编码到令牌中的数据
    # sub (subject): 令牌的主题，这里存储用户ID
    to_encode = {"sub": subject}

    # 计算令牌过期时间
    # 如果提供了自定义过期时间，使用它；否则使用配置中的默认时间
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # 添加过期时间到编码数据中
    # exp (expiration): 令牌的过期时间戳
    to_encode.update({"exp": expire})

    # 使用JWT库编码令牌
    # 参数说明：
    # - to_encode: 要编码到令牌中的数据
    # - settings.SECRET_KEY: 用于签名的密钥
    # - algorithm=settings.ALGORITHM: 签名算法（HS256）
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encoded_jwt
