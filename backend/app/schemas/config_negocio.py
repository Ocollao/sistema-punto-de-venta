from pydantic import BaseModel
from typing import Optional


class ConfigNegocioResponse(BaseModel):
    id: int
    nombre: str
    rut: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    mensaje_pie: Optional[str] = None

    class Config:
        from_attributes = True


class ConfigNegocioUpdate(BaseModel):
    nombre: Optional[str] = None
    rut: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    mensaje_pie: Optional[str] = None
