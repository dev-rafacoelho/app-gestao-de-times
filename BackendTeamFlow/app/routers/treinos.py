from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database.database import get_db
from app.models.models import Treino, ParticipacaoTreino, User, Clube
from app.schemas.treinos import (
    TreinoCreate,
    TreinoUpdate,
    TreinoResponse,
    TreinoSimples,
    ParticipacaoTreinoCreate,
    ParticipacaoTreinoResponse
)

router = APIRouter(
    prefix="/treinos",
    tags=["treinos"]
)

# ===== ROTAS PARA TÉCNICOS =====

@router.post("/", response_model=TreinoResponse)
def criar_treino(
    treino: TreinoCreate,
    tecnico_id: int = Query(..., description="ID do técnico que está criando o treino"),
    db: Session = Depends(get_db)
):
    """Técnico cria um novo treino para seu clube"""
    # Verificar se o usuário é técnico e tem um clube
    tecnico = db.query(User).filter(User.id == tecnico_id).first()
    if not tecnico:
        raise HTTPException(status_code=404, detail="Técnico não encontrado")
    
    if tecnico.tipo_user_id != 2:
        raise HTTPException(status_code=403, detail="Apenas técnicos podem criar treinos")
    
    # Buscar o clube do técnico
    clube = db.query(Clube).filter(Clube.tecnico_id == tecnico_id).first()
    if not clube:
        raise HTTPException(status_code=404, detail="Técnico não possui clube")
    
    # Criar o treino
    novo_treino = Treino(
        titulo=treino.titulo,
        descricao=treino.descricao,
        data_hora=treino.data_hora,
        local=treino.local,
        clube_id=clube.id,
        criado_por=tecnico_id,
        data_criacao=datetime.now()
    )
    
    db.add(novo_treino)
    db.commit()
    db.refresh(novo_treino)
    
    # Criar participações pendentes para todos os jogadores do clube
    jogadores = db.query(User).filter(
        User.clube_id == clube.id,
        User.tipo_user_id == 1  # Apenas jogadores
    ).all()
    
    for jogador in jogadores:
        participacao = ParticipacaoTreino(
            treino_id=novo_treino.id,
            jogador_id=jogador.id,
            status="pendente"
        )
        db.add(participacao)
    
    db.commit()
    db.refresh(novo_treino)
    return novo_treino

@router.get("/meus-treinos", response_model=List[TreinoResponse])
def listar_meus_treinos(
    tecnico_id: int = Query(..., description="ID do técnico"),
    incluir_inativos: bool = Query(False, description="Incluir treinos inativos"),
    db: Session = Depends(get_db)
):
    """Técnico lista todos os treinos que criou"""
    query = db.query(Treino).filter(Treino.criado_por == tecnico_id)
    
    if not incluir_inativos:
        query = query.filter(Treino.ativo == True)
    
    treinos = query.order_by(Treino.data_hora.desc()).all()
    return treinos

@router.put("/{treino_id}", response_model=TreinoResponse)
def atualizar_treino(
    treino_id: int,
    treino_update: TreinoUpdate,
    tecnico_id: int = Query(..., description="ID do técnico"),
    db: Session = Depends(get_db)
):
    """Técnico atualiza um treino que criou"""
    treino = db.query(Treino).filter(
        Treino.id == treino_id,
        Treino.criado_por == tecnico_id
    ).first()
    
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado ou você não tem permissão")
    
    # Atualizar apenas os campos fornecidos
    for field, value in treino_update.dict(exclude_unset=True).items():
        setattr(treino, field, value)
    
    db.commit()
    db.refresh(treino)
    return treino

# ===== ROTAS PARA JOGADORES =====

@router.get("/clube/{clube_id}", response_model=List[TreinoSimples])
def listar_treinos_clube(
    clube_id: int,
    jogador_id: int = Query(..., description="ID do jogador"),
    db: Session = Depends(get_db)
):
    """Jogador lista treinos do seu clube"""
    print(f"Debug - Buscando treinos para clube_id: {clube_id}, jogador_id: {jogador_id}")
    
    # Verificar se o jogador faz parte do clube
    jogador = db.query(User).filter(
        User.id == jogador_id,
        User.clube_id == clube_id,
        User.tipo_user_id == 1
    ).first()
    
    print(f"Debug - Jogador encontrado: {jogador is not None}")
    if jogador:
        print(f"Debug - Dados do jogador: id={jogador.id}, clube_id={jogador.clube_id}, tipo={jogador.tipo_user_id}")
    
    if not jogador:
        print(f"Debug - Jogador não encontrado ou não é do clube")
        raise HTTPException(status_code=403, detail="Você não faz parte deste clube ou não é jogador")
    
    # Buscar treinos do clube (incluindo passados para visualização completa)
    treinos = db.query(Treino).filter(
        Treino.clube_id == clube_id,
        Treino.ativo == True
    ).order_by(Treino.data_hora.desc()).all()
    
    print(f"Debug - Treinos encontrados: {len(treinos)}")
    
    return treinos

@router.get("/minhas-participacoes", response_model=List[ParticipacaoTreinoResponse])
def listar_minhas_participacoes(
    jogador_id: int = Query(..., description="ID do jogador"),
    db: Session = Depends(get_db)
):
    """Jogador lista suas participações em treinos"""
    # Verificar se o jogador existe
    jogador = db.query(User).filter(User.id == jogador_id).first()
    if not jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado")
    
    # Buscar participações incluindo dados do treino e do jogador
    participacoes = db.query(ParticipacaoTreino).filter(
        ParticipacaoTreino.jogador_id == jogador_id
    ).join(Treino).filter(Treino.ativo == True).all()
    
    # Adicionar informações do jogador a cada participação
    for participacao in participacoes:
        if not hasattr(participacao, 'jogador') or not participacao.jogador:
            participacao.jogador = jogador
    
    return participacoes

@router.put("/participacao/{treino_id}", response_model=ParticipacaoTreinoResponse)
def responder_treino(
    treino_id: int,
    resposta: ParticipacaoTreinoCreate,
    jogador_id: int = Query(..., description="ID do jogador"),
    db: Session = Depends(get_db)
):
    """Jogador aceita ou rejeita participação em treino"""
    # Verificar se a participação existe
    participacao = db.query(ParticipacaoTreino).filter(
        ParticipacaoTreino.treino_id == treino_id,
        ParticipacaoTreino.jogador_id == jogador_id
    ).first()
    
    if not participacao:
        raise HTTPException(status_code=404, detail="Participação não encontrada")
    
    # Verificar se o treino ainda está ativo e no futuro
    treino = db.query(Treino).filter(Treino.id == treino_id).first()
    if not treino or not treino.ativo:
        raise HTTPException(status_code=400, detail="Treino não está mais ativo")
    
    if treino.data_hora <= datetime.now():
        raise HTTPException(status_code=400, detail="Não é possível responder a treinos que já ocorreram")
    
    # Atualizar participação
    participacao.status = resposta.status
    participacao.observacao = resposta.observacao
    participacao.data_resposta = datetime.now()
    
    db.commit()
    db.refresh(participacao)
    return participacao

# ===== ROTAS GERAIS =====

@router.get("/{treino_id}", response_model=TreinoResponse)
def obter_treino(
    treino_id: int,
    user_id: int = Query(..., description="ID do usuário"),
    db: Session = Depends(get_db)
):
    """Obter detalhes de um treino específico"""
    treino = db.query(Treino).filter(Treino.id == treino_id).first()
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    
    # Verificar se o usuário tem acesso (técnico do clube ou jogador do clube)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Técnico: deve ser o criador do treino
    # Jogador: deve fazer parte do clube
    if user.tipo_user_id == 2:  # Técnico
        if treino.criado_por != user_id:
            raise HTTPException(status_code=403, detail="Acesso negado")
    elif user.tipo_user_id == 1:  # Jogador
        if user.clube_id != treino.clube_id:
            raise HTTPException(status_code=403, detail="Acesso negado")
    else:
        raise HTTPException(status_code=403, detail="Tipo de usuário inválido")
    
    return treino 