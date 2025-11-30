"""
论坛与话题评分系统 - 用户认证API

这个文件处理用户注册和登录相关的API端点，包括：
1. 用户注册 - 创建新用户账户
2. 用户登录 - 验证用户凭据并返回访问令牌

认证流程：
- 注册：用户提供用户名、密码、昵称，系统创建新用户并返回用户信息
- 登录：用户提供用户名和密码，系统验证后返回JWT访问令牌

安全考虑：
- 密码在存储前会进行哈希处理，不存储明文密码
- 使用JWT令牌进行无状态认证
- 令牌有过期时间，防止长期有效
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# 导入项目中的依赖和工具函数
from app.api.deps import get_db  # 数据库会话依赖
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)  # 安全工具函数
from app.models.models import User  # 用户数据模型
from app.schemas.auth import Token  # 令牌响应模式
from app.schemas.user import UserCreate, UserOut  # 用户相关模式

# 创建认证相关的API路由器
# prefix="/auth": 所有路由都会以/api/v1/auth开头
# tags=["auth"]: 在API文档中将这个路由器的所有端点分组到"auth"标签下
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    用户注册端点

    这个端点允许新用户创建账户，接收用户信息并创建新用户记录。

    工作流程：
    1. 检查用户名是否已被注册
    2. 对密码进行哈希处理
    3. 创建新用户记录
    4. 返回创建的用户信息（不包含密码）

    Args:
        user_in: 用户注册信息，包含用户名、密码、昵称和角色
        db: 数据库会话，用于执行数据库操作

    Returns:
        UserOut: 创建成功的用户信息（不包含密码哈希）

    Raises:
        HTTPException: 当用户名已被注册时返回400错误

    Example Request:
        POST /api/v1/auth/register
        {
            "username": "newuser",
            "password": "securepassword123",
            "nickname": "New User",
            "role": "user"
        }

    Example Response:
        {
            "user_id": 1,
            "username": "newuser",
            "nickname": "New User",
            "role": "user",
            "created_at": "2024-01-01T00:00:00"
        }
    """
    # 检查用户名是否已被注册
    # 查询数据库中是否已存在相同用户名的用户
    exists = db.query(User).filter(User.username == user_in.username).first()
    if exists:
        # 如果用户名已存在，返回400错误
        # 这是为了防止用户名冲突
        raise HTTPException(status_code=400, detail="Username already registered")

    # 创建新用户对象
    # 使用UserCreate模式中的数据初始化用户对象
    user = User(
        username=user_in.username,  # 用户名
        password_hash=get_password_hash(
            user_in.password
        ),  # 密码哈希值（不存储明文密码）
        nickname=user_in.nickname,  # 用户昵称
        role=user_in.role or "user",  # 用户角色，默认为"user"
    )

    # 将新用户添加到数据库会话
    db.add(user)
    # 提交事务，将用户保存到数据库
    db.commit()
    # 刷新对象，从数据库加载生成的主键和其他默认值
    db.refresh(user)

    # 返回创建的用户信息
    # response_model=UserOut确保返回的数据符合UserOut模式
    # 不会返回密码哈希等敏感信息
    return user


@router.post("/token", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    用户登录端点（获取访问令牌）

    这个端点验证用户凭据并返回JWT访问令牌。
    使用OAuth2密码流程，这是最常用的认证方式。

    工作流程：
    1. 根据用户名查找用户
    2. 验证密码是否正确
    3. 生成JWT访问令牌
    4. 返回令牌信息

    Args:
        form_data: OAuth2密码请求表单，包含用户名和密码
        db: 数据库会话，用于查询用户信息

    Returns:
        Token: 包含访问令牌和令牌类型的响应

    Raises:
        HTTPException: 当用户名或密码错误时返回400错误

    Example Request:
        POST /api/v1/auth/token
        Content-Type: application/x-www-form-urlencoded
        username=newuser&password=securepassword123

    Example Response:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }

    Security Notes:
        - 客户端应该在Authorization头中使用Bearer令牌：Authorization: Bearer <token>
        - 令牌有过期时间，客户端需要处理令牌刷新
        - 建议在生产环境中使用HTTPS传输敏感信息
    """
    # 根据用户名查询用户
    # 在数据库中查找匹配的用户名
    user = db.query(User).filter(User.username == form_data.username).first()

    # 验证用户是否存在且密码正确
    # 如果用户不存在或密码验证失败，返回认证错误
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password",
        )

    # 生成JWT访问令牌
    # 使用用户ID作为令牌的主题(subject)
    # 令牌中不包含敏感信息，只有用户标识
    access_token = create_access_token(subject=user.user_id)

    # 返回令牌响应
    # Token模式包含access_token和token_type字段
    # token_type固定为"bearer"，表示这是Bearer令牌
    return Token(access_token=access_token)
