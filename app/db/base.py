"""
论坛与话题评分系统 - SQLAlchemy 数据库模型基类

这个文件定义了SQLAlchemy的声明式基类，所有数据模型类都应该继承自这个Base类。

SQLAlchemy是一个Python ORM（对象关系映射）库，它允许我们：
1. 使用Python类来定义数据库表结构
2. 通过对象操作来执行数据库查询和修改
3. 自动处理数据库连接和事务

声明式基类模式是SQLAlchemy推荐的方式，它提供了：
- 自动的表名映射
- 列和关系的声明式定义
- 查询接口的便捷访问
"""

from sqlalchemy.orm import declarative_base

# 创建SQLAlchemy声明式基类
# declarative_base()函数返回一个基类，所有数据模型都应该继承自这个类
# 这个基类会自动处理：
# - 表名映射（通过__tablename__属性）
# - 列定义（通过Column对象）
# - 关系定义（通过relationship）
# - 查询接口
#
# 当我们在其他文件中定义模型类时，只需要：
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True)
#     name = Column(String)
#
# SQLAlchemy会自动将这些类映射到数据库表，并提供强大的查询能力

Base = declarative_base()
