from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Your PostgreSQL connection string - changed from postgres:// to postgresql://
DATABASE_URL = "postgresql://postgres:65cba20f02c792fdb2d4@easypanel.rafaelcoelho.shop:5438/teste?sslmode=disable"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 