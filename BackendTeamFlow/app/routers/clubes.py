from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import or_

from app.database.database import get_db
from app.models.models import Clube, User
from app.schemas.schemas import Clube as ClubeSchema, ClubeCreate

router = APIRouter(
    prefix="/clubes",
    tags=["clubes"],
)

@router.get("/", response_model=List[ClubeSchema])
def get_clubes(nome: str = None, db: Session = Depends(get_db)):
    query = db.query(Clube)
    
    if nome:
        query = query.filter(Clube.nome.ilike(f"%{nome}%"))
    
    clubes = query.all()
    return clubes

@router.post("/", response_model=ClubeSchema, status_code=status.HTTP_201_CREATED)
def create_clube(clube: ClubeCreate, db: Session = Depends(get_db)):
    # Verificar se o técnico existe e é do tipo técnico (tipo_user_id == 2)
    tecnico = db.query(User).filter(
        User.id == clube.tecnico_id,
        User.tipo_user_id == 2
    ).first()
    
    if not tecnico:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Técnico não encontrado ou usuário não é um técnico"
        )
    
    db_clube = Clube(**clube.dict())
    db.add(db_clube)
    db.commit()
    db.refresh(db_clube)
    return db_clube

@router.get("/{clube_id}", response_model=ClubeSchema)
def get_clube(clube_id: int, db: Session = Depends(get_db)):
    clube = db.query(Clube).filter(Clube.id == clube_id).first()
    if clube is None:
        raise HTTPException(status_code=404, detail="Clube não encontrado")
    return clube

@router.put("/{clube_id}", response_model=ClubeSchema)
def update_clube(clube_id: int, clube: ClubeCreate, db: Session = Depends(get_db)):
    db_clube = db.query(Clube).filter(Clube.id == clube_id).first()
    if db_clube is None:
        raise HTTPException(status_code=404, detail="Clube não encontrado")
    
    # Verificar se o novo técnico existe e é do tipo técnico
    if clube.tecnico_id != db_clube.tecnico_id:
        tecnico = db.query(User).filter(
            User.id == clube.tecnico_id,
            User.tipo_user_id == 2
        ).first()
        
        if not tecnico:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Técnico não encontrado ou usuário não é um técnico"
            )
    
    for key, value in clube.dict().items():
        setattr(db_clube, key, value)
    
    db.commit()
    db.refresh(db_clube)
    return db_clube

@router.delete("/{clube_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_clube(clube_id: int, db: Session = Depends(get_db)):
    db_clube = db.query(Clube).filter(Clube.id == clube_id).first()
    if db_clube is None:
        raise HTTPException(status_code=404, detail="Clube não encontrado")
    
    db.delete(db_clube)
    db.commit()
    return None 