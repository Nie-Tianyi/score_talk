"""
论坛与话题评分系统 - API依赖注入和认证管理

这个文件定义了FastAPI的依赖注入函数，用于：
1. 管理数据库会话的生命周期
2. 处理用户认证和授权
3. 提供当前用户信息
4. 验证管理员权限

依赖注入是FastAPI的核心特性，它允许我们：
- 自动处理重复的逻辑（如数据库连接、用户认证）
- 提高代码的可测试性和可维护性
- 减少代码重复

每个依赖函数都可以在其他路由函数中通过Depends()使用，FastAPI会自动调用它们。
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password
from app.db.session import SessionLocal
from app.models.models import User
from app.schemas.auth import TokenData

# 创建OAuth2密码承载方案
# 这个对象用于处理Bearer令牌认证
# tokenUrl参数指定了获取令牌的端点路径
# 当客户端在Authorization头中发送Bearer令牌时，FastAPI会自动验证
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_db():
    """
    数据库会话依赖函数

    这个函数为每个请求创建一个新的数据库会话，并在请求完成后自动关闭。
    使用yield语句实现上下文管理器模式，确保会话正确关闭。

    FastAPI的依赖注入系统会自动调用这个函数，并将返回的数据库会话传递给路由函数。

    工作流程：
    1. 请求到达时创建新的数据库会话
    2. 将会话传递给路由函数使用
    3. 请求处理完成后自动关闭会话
    4. 即使发生异常也会确保会话被关闭

    这种模式避免了数据库连接泄漏，确保每个请求都有独立的会话。
    """
    # 从会话工厂创建新的数据库会话
    db = SessionLocal()
    try:
        # 将会话提供给依赖这个函数的路由使用
        yield db
    finally:
        # 无论请求成功还是失败，都要确保关闭数据库会话
        # 这是防止数据库连接泄漏的关键
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    获取当前认证用户依赖函数

    这个函数验证JWT令牌并返回对应的用户对象。
    如果令牌无效或用户不存在，会抛出401未授权异常。

    工作流程：
    1. 从Authorization头中提取Bearer令牌
    2. 解码并验证JWT令牌
    3. 从令牌中提取用户ID
    4. 从数据库中查询对应的用户
    5. 返回用户对象

    这个依赖函数可以用于任何需要用户认证的路由。
    如果路由函数依赖这个函数，只有认证用户才能访问。

    Args:
        token: 从Authorization头中提取的JWT令牌
        db: 数据库会话，用于查询用户信息

    Returns:
        User: 认证成功的用户对象

    Raises:
        HTTPException: 当令牌无效或用户不存在时抛出401错误
    """
    # 定义认证失败的异常信息
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},  # 告诉客户端使用Bearer认证
    )

    try:
        # 解码JWT令牌
        # 使用应用的密钥和算法验证令牌签名
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        # 从令牌负载中获取用户ID（subject）
        sub = payload.get("sub")
        if sub is None:
            # 如果令牌中没有用户ID，说明令牌无效
            raise credentials_exception
        # 创建TokenData对象，包含用户ID
        token_data = TokenData(user_id=int(sub))
    except (JWTError, ValueError):
        # 捕获所有JWT相关的错误（签名无效、过期、格式错误等）
        # 或者用户ID转换失败的错误
        raise credentials_exception

    # 根据令牌中的用户ID查询数据库
    user = db.query(User).filter(User.user_id == token_data.user_id).first()
    if user is None:
        # 如果数据库中找不到对应的用户，说明令牌无效
        raise credentials_exception

    # 返回认证成功的用户对象
    # 路由函数可以通过这个对象获取当前用户的信息
    return user


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    获取当前管理员用户依赖函数

    这个函数验证当前用户是否具有管理员权限。
    它依赖于get_current_user函数，先确保用户已认证，再检查角色。

    工作流程：
    1. 先调用get_current_user获取当前用户
    2. 检查用户的role字段是否为"admin"
    3. 如果是管理员，返回用户对象
    4. 如果不是管理员，抛出403禁止访问异常

    这个依赖函数用于保护需要管理员权限的路由。

    Args:
        current_user: 通过get_current_user依赖获取的当前用户

    Returns:
        User: 具有管理员权限的用户对象

    Raises:
        HTTPException: 当用户不是管理员时抛出403错误
    """
    if current_user.role != "admin":
        # 如果用户角色不是admin，抛出权限不足异常
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )

    # 返回管理员用户对象
    return current_user
