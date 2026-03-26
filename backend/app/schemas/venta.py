from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ItemCarrito(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float


class VentaCreate(BaseModel):
    items: List[ItemCarrito]
    descuento: float = 0.0
    metodo_pago: str = "efectivo"
    cliente_id: Optional[int] = None


class DetalleVentaResponse(BaseModel):
    id: int
    producto_id: int
    producto_nombre: Optional[str] = None
    cantidad: int
    precio_unitario: float
    subtotal: float

    class Config:
        from_attributes = True


class VentaResponse(BaseModel):
    id: int
    numero_boleta: str
    subtotal: float
    descuento: float
    total: float
    metodo_pago: str
    estado: str
    usuario_id: int
    cliente_id: Optional[int] = None
    creado_en: datetime
    detalles: List[DetalleVentaResponse] = []

    class Config:
        from_attributes = True


class ResumenReporte(BaseModel):
    total_ventas: int
    ingresos_totales: float
    ticket_promedio: float
    productos_vendidos: int
