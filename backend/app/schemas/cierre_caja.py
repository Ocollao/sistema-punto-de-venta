from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class CierreCajaCreate(BaseModel):
    fecha: date
    monto_inicial: float = 0.0
    efectivo_declarado: Optional[float] = None
    notas: Optional[str] = None


class CierreCajaResponse(BaseModel):
    id: int
    fecha: date
    total_ventas: int
    ingresos_totales: float
    total_descuentos: float
    efectivo_total: float
    debito_total: float
    credito_total: float
    monto_inicial: float
    efectivo_esperado: float
    efectivo_declarado: Optional[float] = None
    diferencia: Optional[float] = None
    notas: Optional[str] = None
    usuario_id: int
    creado_en: datetime

    class Config:
        from_attributes = True
