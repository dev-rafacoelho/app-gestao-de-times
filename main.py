from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
from dotenv import load_dotenv

from app.database.database import engine, get_db
from app.database.database import Base
from app.routers import auth, users, tipo_users

# Load environment variables
load_dotenv()

# Create the tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=os.getenv("APP_NAME", "API de Gerenciamento de Times"))

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tipo_users.router)

@app.get("/")
def read_root():
    return {"message": os.getenv("APP_NAME", "API de Gerenciamento de Times")}

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "development")}

@app.get("/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Test database connection
        result = db.execute(text("SELECT 1")).fetchone()
        if result:
            return {"message": "Database connection successful", "result": result[0]}
        return {"message": "Database connection failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        debug=os.getenv("DEBUG", "False").lower() == "true"
    ) 