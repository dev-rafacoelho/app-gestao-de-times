from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base

class TipoUser(Base):
    __tablename__ = "tipos_usuario"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    is_tecnico = Column(Boolean, default=False)
    
    # Relationship
    users = relationship("User", back_populates="tipo_user")

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    data_nascimento = Column(Date, nullable=False)
    telefone = Column(String, nullable=False)
    senha = Column(String, nullable=False)
    tipo_user_id = Column(Integer, ForeignKey("tipos_usuario.id"), nullable=False)
    clube_id = Column(Integer, ForeignKey("clubes.id"), nullable=True, default=None)
    
    # Relationships
    tipo_user = relationship("TipoUser", back_populates="users")
    clube = relationship("Clube", foreign_keys=[clube_id], back_populates="usuarios")

class Clube(Base):
    __tablename__ = "clubes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tecnico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    procurando_jogadores = Column(Boolean, nullable=False)
    
    # Relationships
    tecnico = relationship("User", foreign_keys=[tecnico_id], back_populates="clube_tecnico")
    usuarios = relationship("User", foreign_keys=[User.clube_id], back_populates="clube")

    # Add back reference for tecnico relationship
    User.clube_tecnico = relationship("Clube", foreign_keys=[tecnico_id], back_populates="tecnico", overlaps="clube")

class TeamAccessRequest(Base):
    __tablename__ = "solicitacoes_acesso_time"

    id = Column(Integer, primary_key=True, index=True)
    jogador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    clube_id = Column(Integer, ForeignKey("clubes.id"), nullable=False)
    status = Column(String, nullable=False, default="pendente")  # pendente, aprovado, rejeitado
    data_solicitacao = Column(Date, nullable=False)
    data_resposta = Column(Date, nullable=True)
    observacao = Column(String, nullable=True)
    
    # Relationships
    jogador = relationship("User", foreign_keys=[jogador_id], backref="solicitacoes_acesso")
    clube = relationship("Clube", foreign_keys=[clube_id], backref="solicitacoes_acesso") 