"""
论坛与话题评分系统 - 数据库模型定义

这个文件定义了应用程序的所有数据模型，使用SQLAlchemy ORM来映射数据库表结构。

每个模型类对应数据库中的一个表，类的属性对应表中的列。
SQLAlchemy会自动处理Python对象与数据库记录之间的转换。

模型关系说明：
- User（用户）可以创建多个Post（帖子）和Comment（评论）
- User可以对多个Topic（话题）进行Rating（评分）
- Post（帖子）属于一个User，可以有多个Comment（评论）
- Comment（评论）属于一个Post和一个User
- Topic（话题）可以有多个Rating（评分）
- Rating（评分）属于一个User和一个Topic

数据库设计遵循关系数据库的规范化原则，避免数据冗余。
"""

from datetime import datetime, UTC

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    """
    用户模型 - 存储系统用户信息

    这个表存储所有注册用户的基本信息，包括：
    - 登录凭据（用户名和密码哈希）
    - 用户资料（昵称）
    - 权限管理（角色）
    - 账户创建时间

    用户与其他模型的关系：
    - 一个用户可以创建多个帖子（posts）
    - 一个用户可以发表多个评论（comments）
    - 一个用户可以对多个话题进行评分（ratings）
    """

    __tablename__ = "User"  # 数据库表名

    # 主键，自动递增的用户ID，用于唯一标识每个用户
    user_id = Column(Integer, primary_key=True, index=True)

    # 用户名，必须唯一且不能为空，建立索引提高查询性能
    username = Column(String(50), unique=True, nullable=False, index=True)

    # 密码哈希值，存储加密后的密码，不存储明文密码
    password_hash = Column(String(255), nullable=False)

    # 用户昵称，显示给其他用户的名称
    nickname = Column(String(50), nullable=False)

    # 用户角色，用于权限控制，默认是普通用户
    role = Column(String(20), default="user", nullable=False)

    # 账户创建时间，自动设置为当前时间
    created_at = Column(DateTime, default=datetime.now(UTC), nullable=False)

    # 定义关系 - 一个用户可以创建多个帖子
    # back_populates: 双向关系，Post模型中也有关联字段
    # cascade: 当用户被删除时，自动删除其所有帖子
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")

    # 定义关系 - 一个用户可以发表多个评论
    comments = relationship(
        "Comment", back_populates="author", cascade="all, delete-orphan"
    )

    # 定义关系 - 一个用户可以对多个话题进行评分
    ratings = relationship(
        "Rating", back_populates="user", cascade="all, delete-orphan"
    )


class Topic(Base):
    """
    话题模型 - 存储可被评分的讨论话题

    这个表存储所有可供评分的话题，包括：
    - 话题名称和描述
    - 创建时间

    话题的主要用途是作为评分的对象，用户可以对这些话题进行1-5分的评分。
    """

    __tablename__ = "Topic"

    # 主键，自动递增的话题ID
    topic_id = Column(Integer, primary_key=True, index=True)

    # 话题名称，必须唯一且不能为空
    name = Column(String(100), unique=True, nullable=False, index=True)

    # 话题描述，可选字段
    description = Column(String(255))

    # 话题创建时间
    created_at = Column(DateTime, default=datetime.now(UTC), nullable=False)

    # 定义关系 - 一个话题可以有多个评分
    ratings = relationship(
        "Rating", back_populates="topic", cascade="all, delete-orphan"
    )


class Post(Base):
    """
    帖子模型 - 存储用户发表的帖子内容

    这个表存储论坛中的所有帖子，包括：
    - 帖子标题和内容
    - 作者信息
    - 发布时间和更新时间
    - 软删除标记（逻辑删除而非物理删除）

    软删除机制：通过is_deleted字段标记删除状态，而不是真正从数据库删除记录。
    这样可以保留数据完整性，同时满足删除需求。
    """

    __tablename__ = "Post"

    # 主键，自动递增的帖子ID
    post_id = Column(Integer, primary_key=True, index=True)

    # 外键，关联到User表的user_id，表示帖子的作者
    author_id = Column(Integer, ForeignKey("User.user_id"), nullable=False, index=True)

    # 帖子标题
    title = Column(String(200), nullable=False)

    # 帖子正文内容，使用Text类型支持长文本
    content = Column(Text, nullable=False)

    # 软删除标记，True表示帖子已被删除（逻辑删除）
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)

    # 帖子创建时间
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 帖子最后更新时间，当记录更新时自动设置为当前时间
    updated_at = Column(
        DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC), nullable=False
    )

    # 定义关系 - 帖子属于一个用户（作者）
    author = relationship("User", back_populates="posts")

    # 定义关系 - 一个帖子可以有多个评论
    comments = relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )


class Comment(Base):
    """
    评论模型 - 存储用户对帖子的回复评论

    这个表存储所有帖子的评论，包括：
    - 评论内容
    - 所属帖子和作者
    - 发布时间
    - 软删除标记

    评论与帖子的关系是多对一，一个帖子可以有多个评论。
    """

    __tablename__ = "Comment"

    # 主键，自动递增的评论ID
    comment_id = Column(Integer, primary_key=True, index=True)

    # 外键，关联到Post表的post_id，表示评论所属的帖子
    post_id = Column(Integer, ForeignKey("Post.post_id"), nullable=False, index=True)

    # 外键，关联到User表的user_id，表示评论的作者
    author_id = Column(Integer, ForeignKey("User.user_id"), nullable=False, index=True)

    # 评论内容
    content = Column(Text, nullable=False)

    # 软删除标记
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)

    # 评论创建时间
    created_at = Column(DateTime, default=datetime.now(UTC), nullable=False)

    # 定义关系 - 评论属于一个帖子
    post = relationship("Post", back_populates="comments")

    # 定义关系 - 评论属于一个用户（作者）
    author = relationship("User", back_populates="comments")


class Rating(Base):
    """
    评分模型 - 存储用户对话题的评分

    这个表存储用户对话题的评分记录，包括：
    - 评分值（1-5分）
    - 评分评论
    - 评分时间和更新时间

    设计特点：
    - 每个用户对每个话题只能评分一次（通过唯一约束保证）
    - 评分值必须在1-5之间（通过检查约束保证）
    - 支持更新评分（通过updated_at字段跟踪）
    """

    __tablename__ = "Rating"

    # 主键，自动递增的评分ID
    rating_id = Column(Integer, primary_key=True, index=True)

    # 外键，关联到User表的user_id，表示评分的用户
    user_id = Column(Integer, ForeignKey("User.user_id"), nullable=False, index=True)

    # 外键，关联到Topic表的topic_id，表示被评分的话题
    topic_id = Column(Integer, ForeignKey("Topic.topic_id"), nullable=False, index=True)

    # 评分值，1-5分
    score = Column(Integer, nullable=False)

    # 评分时的评论（可选）
    comment = Column(String(255))

    # 评分创建时间
    created_at = Column(DateTime, default=datetime.now(UTC), nullable=False)

    # 评分最后更新时间，当评分被修改时自动更新
    updated_at = Column(
        DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC), nullable=False
    )

    # 定义关系 - 评分属于一个用户
    user = relationship("User", back_populates="ratings")

    # 定义关系 - 评分属于一个话题
    topic = relationship("Topic", back_populates="ratings")

    # 表级约束定义
    __table_args__ = (
        # 唯一约束：确保每个用户对每个话题只能评分一次
        # 防止同一个用户对同一个话题重复评分
        UniqueConstraint("user_id", "topic_id", name="uq_rating_user_topic"),
        # 检查约束：确保评分值在1-5之间
        # 数据库层面保证数据有效性
        CheckConstraint("score BETWEEN 1 AND 5", name="ck_rating_score"),
    )
