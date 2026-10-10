"""Run with python -m app.db.check to verify the configured database."""
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import engine


def main() -> int:
    try:
        with engine.connect() as connection:
            assert connection.scalar(select(1)) == 1
        print("PostgreSQL connection successful.")
        return 0
    except SQLAlchemyError:
        print("PostgreSQL connection failed. Check the service and DATABASE_URL in Backend/.env.")
        return 1
    finally:
        engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
