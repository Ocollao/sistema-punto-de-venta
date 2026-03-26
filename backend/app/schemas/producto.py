from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    stock_minimo: int = 5
    categoria_id: Optional[int] = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    stock_minimo: Optional[int] = None
    categoria_id: Optional[int] = None
    activo: Optional[bool] = None


class ProductoResponse(ProductoBase):
    id: int
    imagen_url: Optional[str] = None
    activo: bool
    creado_en: datetime
    categoria_nombre: Optional[str] = None

    class Config:
        from_attributes = True
