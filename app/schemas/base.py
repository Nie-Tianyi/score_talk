from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """所有需要 from_attributes=True 的响应模型都继承这个"""
    model_config = ConfigDict(from_attributes=True)
