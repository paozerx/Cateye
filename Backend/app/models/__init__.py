"""Import all ORM model classes here so Alembic can discover their tables."""

from app.models.user import User

__all__ = ["User"]
