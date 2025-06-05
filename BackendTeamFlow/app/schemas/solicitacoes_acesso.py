from pydantic import BaseModel
from datetime import date
from typing import Optional

class SolicitacaoAcessoBase(BaseModel):
    clube_id: int
    observacao: Optional[str] = None

class SolicitacaoAcessoCreate(SolicitacaoAcessoBase):
    pass

class SolicitacaoAcessoUpdate(BaseModel):
    status: str  # "aprovado" ou "rejeitado"
    observacao: Optional[str] = None

# Schema para o clube na resposta
class ClubeInResponse(BaseModel):
    id: int
    nome: str
    tecnico_id: int
    procurando_jogadores: Optional[bool] = False
    
    class Config:
        from_attributes = True

# Schema para o jogador na resposta
class JogadorInResponse(BaseModel):
    id: int
    nome: str
    email: str
    
    class Config:
        from_attributes = True

class SolicitacaoAcessoResponse(SolicitacaoAcessoBase):
    id: int
    jogador_id: int
    status: str
    data_solicitacao: date
    data_resposta: Optional[date] = None
    
    # Adicionar as relações opcionalmente
    clube: Optional[ClubeInResponse] = None
    jogador: Optional[JogadorInResponse] = None

    class Config:
        from_attributes = True 