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

class SolicitacaoAcessoResponse(SolicitacaoAcessoBase):
    id: int
    jogador_id: int
    status: str
    data_solicitacao: date
    data_resposta: Optional[date] = None

    class Config:
        from_attributes = True 