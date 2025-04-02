from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# TipoUser schemas
class TipoUserBase(BaseModel):
    nome: str
    is_tecnico: bool = False

class TipoUserCreate(TipoUserBase):
    pass

class TipoUser(TipoUserBase):
    id: int

    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    nome: str
    email: str
    data_nascimento: date
    telefone: str
    tipo_user_id: int

class UserCreate(UserBase):
    senha: str

class UserLogin(BaseModel):
    email: str
    senha: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class UserWithTipo(User):
    tipo_user: TipoUser
    
    class Config:
        from_attributes = True 