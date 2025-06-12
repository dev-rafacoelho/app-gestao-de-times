from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import or_
from pydantic import BaseModel

from app.database.database import get_db
from app.models.models import Clube, User
from app.schemas.schemas import Clube as ClubeSchema, ClubeCreate

# Schema para atualizar apenas o status procurando_jogadores
class UpdateProcurandoJogadores(BaseModel):
    procurando_jogadores: bool

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

@router.get("/procurando-jogadores", response_model=List[ClubeSchema])
def get_clubes_procurando_jogadores(nome: str = None, db: Session = Depends(get_db)):
    """
    Retorna todos os clubes que estão procurando jogadores.
    Se o parâmetro 'nome' for fornecido, filtra também pelo nome do clube.
    """
    query = db.query(Clube).filter(Clube.procurando_jogadores == True)
    
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

@router.patch("/{clube_id}/procurando-jogadores", response_model=ClubeSchema)
def update_procurando_jogadores(
    clube_id: int, 
    update_data: UpdateProcurandoJogadores, 
    db: Session = Depends(get_db)
):
    """
    Atualiza apenas o status 'procurando_jogadores' de um clube.
    """
    db_clube = db.query(Clube).filter(Clube.id == clube_id).first()
    if db_clube is None:
        raise HTTPException(status_code=404, detail="Clube não encontrado")
    
    db_clube.procurando_jogadores = update_data.procurando_jogadores
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

@router.get("/meu-clube/{tecnico_id}", response_model=ClubeSchema)
def get_clube_do_tecnico(tecnico_id: int, db: Session = Depends(get_db)):
    """
    Retorna o clube que um técnico específico gerencia.
    Para técnicos, o clube_id não está no User, mas sim o tecnico_id está no Clube.
    """
    # Verificar se o usuário é técnico
    tecnico = db.query(User).filter(
        User.id == tecnico_id,
        User.tipo_user_id == 2
    ).first()
    
    if not tecnico:
        raise HTTPException(
            status_code=404, 
            detail="Técnico não encontrado ou usuário não é um técnico"
        )
    
    # Buscar o clube onde este técnico é o responsável
    clube = db.query(Clube).filter(Clube.tecnico_id == tecnico_id).first()
    
    if not clube:
        raise HTTPException(
            status_code=404, 
            detail="Este técnico não possui um clube associado"
        )
    
    return clube 