from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.models import User, Clube
from app.schemas.schemas import User as UserSchema, UserCreate, UserComplete

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/", response_model=List[UserComplete])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserComplete)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserComplete)
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If clube_id is provided, verify if it exists
    if user.clube_id is not None:
        clube = db.query(Clube).filter(Clube.id == user.clube_id).first()
        if not clube:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Clube não encontrado"
            )
    
    # Update user attributes
    for key, value in user.dict().items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return None

@router.patch("/{user_id}/sair-clube", response_model=UserComplete)
def sair_do_clube(user_id: int, db: Session = Depends(get_db)):
    """
    Permite que um jogador saia do clube atual.
    Remove o clube_id do usuário, efetivamente tirando ele do time.
    """
    # Buscar o usuário
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Verificar se é um jogador
    if db_user.tipo_user_id != 1:
        raise HTTPException(
            status_code=400, 
            detail="Apenas jogadores podem sair de clubes"
        )
    
    # Verificar se o jogador faz parte de algum clube
    if not db_user.clube_id:
        raise HTTPException(
            status_code=400,
            detail="Você não faz parte de nenhum clube"
        )
    
    # Guardar o nome do clube para a mensagem de resposta
    clube = db.query(Clube).filter(Clube.id == db_user.clube_id).first()
    clube_nome = clube.nome if clube else "clube"
    
    # Remover o jogador do clube
    db_user.clube_id = None
    
    db.commit()
    db.refresh(db_user)
    
    # Adicionar uma mensagem customizada para a resposta
    response_data = {
        "id": db_user.id,
        "nome": db_user.nome,
        "email": db_user.email,
        "data_nascimento": db_user.data_nascimento,
        "telefone": db_user.telefone,
        "tipo_user_id": db_user.tipo_user_id,
        "clube_id": db_user.clube_id,
        "tipo_user": db_user.tipo_user,
        "clube": None,
        "message": f"Você saiu do {clube_nome} com sucesso"
    }
    
    return db_user

@router.patch("/{jogador_id}/remover-do-clube")
def remover_jogador_do_clube(
    jogador_id: int, 
    tecnico_id: int, 
    db: Session = Depends(get_db)
):
    """
    Permite que um técnico remova um jogador do seu clube.
    Apenas o técnico do clube pode remover jogadores.
    """
    # Buscar o jogador
    db_jogador = db.query(User).filter(User.id == jogador_id).first()
    if not db_jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado")
    
    # Verificar se é um jogador
    if db_jogador.tipo_user_id != 1:
        raise HTTPException(
            status_code=400, 
            detail="Apenas jogadores podem ser removidos de clubes"
        )
    
    # Verificar se o jogador faz parte de algum clube
    if not db_jogador.clube_id:
        raise HTTPException(
            status_code=400,
            detail="Este jogador não faz parte de nenhum clube"
        )
    
    # Buscar o técnico
    db_tecnico = db.query(User).filter(User.id == tecnico_id).first()
    if not db_tecnico:
        raise HTTPException(status_code=404, detail="Técnico não encontrado")
    
    # Verificar se é um técnico
    if db_tecnico.tipo_user_id != 2:
        raise HTTPException(
            status_code=400,
            detail="Apenas técnicos podem remover jogadores"
        )
    
    # Buscar o clube do técnico
    clube_tecnico = db.query(Clube).filter(Clube.tecnico_id == tecnico_id).first()
    if not clube_tecnico:
        raise HTTPException(
            status_code=400,
            detail="Técnico não possui clube associado"
        )
    
    # Verificar se o jogador pertence ao clube do técnico
    if db_jogador.clube_id != clube_tecnico.id:
        raise HTTPException(
            status_code=403,
            detail="Você só pode remover jogadores do seu próprio clube"
        )
    
    # Guardar informações para resposta
    clube_nome = clube_tecnico.nome
    jogador_nome = db_jogador.nome
    
    # Remover o jogador do clube
    db_jogador.clube_id = None
    
    db.commit()
    db.refresh(db_jogador)
    
    return {
        "message": f"Jogador {jogador_nome} foi removido do {clube_nome} com sucesso",
        "jogador_id": db_jogador.id,
        "jogador_nome": db_jogador.nome,
        "clube_nome": clube_nome
    }