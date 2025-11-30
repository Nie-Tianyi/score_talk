from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Forum & Topic Rating API"

    SQLALCHEMY_DATABASE_URI: str = (
        "sqlite:///./app.db"
    )

    SECRET_KEY: str = "CHANGE_ME_IN_ENV"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


settings = Settings()
