from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Schema básico para jogador na resposta
class JogadorBasico(BaseModel):
    id: int
    nome: str
    email: str
    
    class Config:
        from_attributes = True

# Schema para participação no treino
class ParticipacaoTreinoBase(BaseModel):
    status: str  # pendente, aceito, rejeitado
    observacao: Optional[str] = None

class ParticipacaoTreinoCreate(BaseModel):
    status: str
    observacao: Optional[str] = None

class ParticipacaoTreinoResponse(ParticipacaoTreinoBase):
    id: int
    treino_id: int
    jogador_id: int
    data_resposta: Optional[datetime] = None
    jogador: Optional[JogadorBasico] = None
    
    class Config:
        from_attributes = True

# Schema para treino
class TreinoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_hora: datetime
    local: str

class TreinoCreate(TreinoBase):
    pass

class TreinoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    data_hora: Optional[datetime] = None
    local: Optional[str] = None
    ativo: Optional[bool] = None

class TreinoResponse(TreinoBase):
    id: int
    clube_id: int
    criado_por: int
    data_criacao: datetime
    ativo: bool
    participacoes: List[ParticipacaoTreinoResponse] = []
    
    class Config:
        from_attributes = True

# Schema para resposta simples do treino (sem participações)
class TreinoSimples(TreinoBase):
    id: int
    clube_id: int
    criado_por: int
    data_criacao: datetime
    ativo: bool
    
    class Config:
        from_attributes = True 