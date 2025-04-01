from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.database import engine, get_db
from app.database.database import Base

# Create the tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Gerenciamento de Times")

@app.get("/")
def read_root():
    return {"message": "API de Gerenciamento de Times"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

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
    uvicorn.run(app, host="0.0.0.0", port=8000) 