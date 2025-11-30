"""
论坛与话题评分系统 - 认证相关数据模式

这个文件定义了认证功能中使用的Pydantic数据模式，包括：
1. Token - JWT令牌响应格式
2. TokenData - 令牌中存储的用户数据

这些模式用于：
- 验证API请求和响应的数据格式
- 自动生成API文档
- 序列化和反序列化数据

Pydantic模式提供了：
- 自动数据验证
- 类型提示支持
- JSON序列化
- 文档生成
"""

from pydantic import BaseModel


class Token(BaseModel):
    """
    JWT令牌响应模式

    这个模式定义了登录成功后返回的令牌格式。
    遵循OAuth2标准，包含访问令牌和令牌类型。

    字段说明：
    - access_token: JWT访问令牌字符串，用于后续API调用的认证
    - token_type: 令牌类型，固定为"bearer"，表示Bearer令牌

    Bearer令牌的使用方式：
    客户端需要在Authorization头中发送：Bearer <access_token>

    Example:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    令牌数据模式

    这个模式定义了JWT令牌中存储的用户数据。
    当服务器解码JWT令牌时，会使用这个模式来验证令牌内容。

    字段说明：
    - user_id: 用户的唯一标识符，从令牌的"sub"字段提取
               用于在数据库中查找对应的用户记录

    JWT令牌结构：
    - 头部：指定算法和令牌类型
    - 负载：包含user_id和其他声明（如过期时间）
    - 签名：使用密钥对头部和负载进行签名

    Example JWT负载：
        {
            "sub": "123",  # 用户ID
            "exp": 1672531200  # 过期时间戳
        }
    """
    user_id: int
