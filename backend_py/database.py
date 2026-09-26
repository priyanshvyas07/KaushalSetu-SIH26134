"""
Database setup for KaushalSetu AI Labour Market Platform.
Supports PostgreSQL with SQLite fallback for effortless local testing.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file
load_dotenv()

# Database URL from environment variable, default to SQLite for quick local demo
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./kaushalsetu.db"

# If Postgres URL uses postgres://, normalize to postgresql:// for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite requires check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=os.getenv("SQL_DEBUG", "False").lower() in ("true", "1")
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Create all database tables."""
    from . import models  # noqa: F401 - ensure all models are registered
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

