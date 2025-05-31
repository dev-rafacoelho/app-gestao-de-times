from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.models import User, TipoUser
from app.schemas.schemas import UserCreate, User as UserSchema, UserLogin, UserWithTipo

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if tipo_user_id exists
    tipo_user = db.query(TipoUser).filter(TipoUser.id == user.tipo_user_id).first()
    if not tipo_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tipo_user_id"
        )
    
    # Create new user
    db_user = User(
        nome=user.nome,
        email=user.email,
        data_nascimento=user.data_nascimento,
        telefone=user.telefone,
        senha=user.senha,  # In a real application, you would hash the password here
        tipo_user_id=user.tipo_user_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login")
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    # Check if user exists and password matches
    if not user or user.senha != user_credentials.senha:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In a real application, you would generate and return a JWT token here
    return {"message": "Login successful", "user_id": user.id} 