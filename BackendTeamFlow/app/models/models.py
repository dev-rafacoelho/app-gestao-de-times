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
    clube_id = Column(Integer, ForeignKey("clubes.id"), nullable=True)
    
    # Relationships
    tipo_user = relationship("TipoUser", back_populates="users")
    clube = relationship("Clube", foreign_keys=[clube_id], back_populates="usuarios")

class Clube(Base):
    __tablename__ = "clubes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tecnico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    # Relationships
    tecnico = relationship("User", foreign_keys=[tecnico_id], back_populates="clube_tecnico")
    usuarios = relationship("User", foreign_keys=[User.clube_id], back_populates="clube")

    # Add back reference for tecnico relationship
    User.clube_tecnico = relationship("Clube", foreign_keys=[tecnico_id], back_populates="tecnico", overlaps="clube") 