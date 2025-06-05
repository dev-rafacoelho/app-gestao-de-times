from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List
import logging

from app.database.database import get_db
from app.models.models import TeamAccessRequest, User, Clube, TipoUser
from app.schemas.solicitacoes_acesso import (
    SolicitacaoAcessoCreate,
    SolicitacaoAcessoResponse,
    SolicitacaoAcessoUpdate
)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/solicitacoes-acesso",
    tags=["solicitacoes-acesso"]
)

@router.post("/", response_model=SolicitacaoAcessoResponse)
def criar_solicitacao(
    solicitacao: SolicitacaoAcessoCreate,
    user_id: int = Query(..., description="ID do usuário que está fazendo a solicitação"),
    db: Session = Depends(get_db)
):
    logger.info(f"Recebendo solicitação para user_id: {user_id} e clube_id: {solicitacao.clube_id}")
    
    # Verificar se o usuário existe e não é técnico
    user = db.query(User).filter(User.id == user_id).first()
    logger.info(f"Resultado da busca do usuário: {user}")
    
    if not user:
        logger.error(f"Usuário não encontrado com ID: {user_id}")
        raise HTTPException(status_code=404, detail=f"Usuário não encontrado (ID: {user_id})")
    
    tipo_user = db.query(TipoUser).filter(TipoUser.id == user.tipo_user_id).first()
    logger.info(f"Tipo do usuário encontrado: {tipo_user}")
    
    if tipo_user.is_tecnico:
        logger.warning(f"Técnico tentando solicitar acesso: {user_id}")
        raise HTTPException(status_code=400, detail="Técnicos não podem solicitar acesso a times")
    
    # Verificar se o clube existe
    clube = db.query(Clube).filter(Clube.id == solicitacao.clube_id).first()
    logger.info(f"Clube encontrado: {clube}")
    
    if not clube:
        logger.error(f"Clube não encontrado com ID: {solicitacao.clube_id}")
        raise HTTPException(status_code=404, detail=f"Clube não encontrado (ID: {solicitacao.clube_id})")
    
    # Verificar se já existe uma solicitação pendente
    solicitacao_existente = db.query(TeamAccessRequest).filter(
        TeamAccessRequest.jogador_id == user_id,
        TeamAccessRequest.clube_id == solicitacao.clube_id,
        TeamAccessRequest.status == "pendente"
    ).first()
    
    if solicitacao_existente:
        logger.warning(f"Já existe solicitação pendente para user_id: {user_id} e clube_id: {solicitacao.clube_id}")
        raise HTTPException(status_code=400, detail="Já existe uma solicitação pendente para este clube")
    
    # Criar nova solicitação
    nova_solicitacao = TeamAccessRequest(
        jogador_id=user_id,
        clube_id=solicitacao.clube_id,
        data_solicitacao=date.today(),
        observacao=solicitacao.observacao
    )
    
    try:
        db.add(nova_solicitacao)
        db.commit()
        db.refresh(nova_solicitacao)
        logger.info(f"Solicitação criada com sucesso: {nova_solicitacao.id}")
        return nova_solicitacao
    except Exception as e:
        logger.error(f"Erro ao criar solicitação: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar solicitação: {str(e)}")

@router.get("/minhas-solicitacoes", response_model=List[SolicitacaoAcessoResponse])
def listar_minhas_solicitacoes(
    user_id: int = Query(..., description="ID do usuário"),
    db: Session = Depends(get_db)
):
    solicitacoes = db.query(TeamAccessRequest).filter(
        TeamAccessRequest.jogador_id == user_id
    ).all()
    return solicitacoes

@router.get("/clube/{clube_id}", response_model=List[SolicitacaoAcessoResponse])
def listar_solicitacoes_clube(
    clube_id: int,
    user_id: int = Query(..., description="ID do técnico do clube"),
    db: Session = Depends(get_db)
):
    # Verificar se o usuário é técnico do clube
    clube = db.query(Clube).filter(
        Clube.id == clube_id,
        Clube.tecnico_id == user_id
    ).first()
    
    if not clube:
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas o técnico do clube pode ver as solicitações")
    
    solicitacoes = db.query(TeamAccessRequest).filter(
        TeamAccessRequest.clube_id == clube_id
    ).all()
    return solicitacoes

@router.put("/{solicitacao_id}", response_model=SolicitacaoAcessoResponse)
def responder_solicitacao(
    solicitacao_id: int,
    resposta: SolicitacaoAcessoUpdate,
    user_id: int = Query(..., description="ID do técnico do clube"),
    db: Session = Depends(get_db)
):
    # Buscar a solicitação
    solicitacao = db.query(TeamAccessRequest).filter(
        TeamAccessRequest.id == solicitacao_id
    ).first()
    
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")
    
    # Verificar se o usuário é técnico do clube
    clube = db.query(Clube).filter(
        Clube.id == solicitacao.clube_id,
        Clube.tecnico_id == user_id
    ).first()
    
    if not clube:
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas o técnico do clube pode responder solicitações")
    
    if solicitacao.status != "pendente":
        raise HTTPException(status_code=400, detail="Esta solicitação já foi respondida")
    
    # Atualizar a solicitação
    solicitacao.status = resposta.status
    solicitacao.data_resposta = date.today()
    solicitacao.observacao = resposta.observacao
    
    # Se aprovado, adicionar o jogador ao time
    if resposta.status == "aprovado":
        jogador = db.query(User).filter(User.id == solicitacao.jogador_id).first()
        jogador.clube_id = solicitacao.clube_id
    
    db.commit()
    db.refresh(solicitacao)
    return solicitacao 