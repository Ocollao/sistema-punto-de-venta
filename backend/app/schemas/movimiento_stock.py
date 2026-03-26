from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MovimientoStockResponse(BaseModel):
    id: int
    producto_id: int
    producto_nombre: Optional[str] = None
    tipo: str
    cantidad: int
    stock_antes: int
    stock_despues: int
    motivo: Optional[str] = None
    usuario_id: Optional[int] = None
    usuario_nombre: Optional[str] = None
    creado_en: datetime

    class Config:
        from_attributes = True


class AjusteStockCreate(BaseModel):
    producto_id: int
    tipo: str
    cantidad: int
    motivo: Optional[str] = None
