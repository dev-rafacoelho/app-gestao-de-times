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
    
    # Relationship
    tipo_user = relationship("TipoUser", back_populates="users") 