from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.models import TipoUser
from app.schemas.schemas import TipoUser as TipoUserSchema, TipoUserCreate

router = APIRouter(
    prefix="/tipo-users",
    tags=["tipo-users"],
)

@router.get("/", response_model=List[TipoUserSchema])
def get_tipo_users(db: Session = Depends(get_db)):
    tipo_users = db.query(TipoUser).all()
    return tipo_users

@router.get("/{tipo_id}", response_model=TipoUserSchema)
def get_tipo_user(tipo_id: int, db: Session = Depends(get_db)):
    tipo_user = db.query(TipoUser).filter(TipoUser.id == tipo_id).first()
    if tipo_user is None:
        raise HTTPException(status_code=404, detail="User type not found")
    return tipo_user

@router.post("/", response_model=TipoUserSchema, status_code=status.HTTP_201_CREATED)
def create_tipo_user(tipo_user: TipoUserCreate, db: Session = Depends(get_db)):
    db_tipo_user = TipoUser(
        nome=tipo_user.nome,
        is_tecnico=tipo_user.is_tecnico
    )
    db.add(db_tipo_user)
    db.commit()
    db.refresh(db_tipo_user)
    return db_tipo_user

@router.put("/{tipo_id}", response_model=TipoUserSchema)
def update_tipo_user(tipo_id: int, tipo_user: TipoUserCreate, db: Session = Depends(get_db)):
    db_tipo_user = db.query(TipoUser).filter(TipoUser.id == tipo_id).first()
    if db_tipo_user is None:
        raise HTTPException(status_code=404, detail="User type not found")
    
    db_tipo_user.nome = tipo_user.nome
    db_tipo_user.is_tecnico = tipo_user.is_tecnico
    
    db.commit()
    db.refresh(db_tipo_user)
    return db_tipo_user

@router.delete("/{tipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tipo_user(tipo_id: int, db: Session = Depends(get_db)):
    db_tipo_user = db.query(TipoUser).filter(TipoUser.id == tipo_id).first()
    if db_tipo_user is None:
        raise HTTPException(status_code=404, detail="User type not found")
    
    # Check if there are users with this tipo_user_id
    users_count = db.query(TipoUser).join(TipoUser.users).filter(TipoUser.id == tipo_id).count()
    if users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user type with associated users"
        )
    
    db.delete(db_tipo_user)
    db.commit()
    return None 