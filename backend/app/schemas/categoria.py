from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None


class CategoriaResponse(CategoriaBase):
    id: int
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True
