from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MovimientoStock(Base):
    __tablename__ = "movimientos_stock"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # venta | ajuste_entrada | ajuste_salida
    cantidad = Column(Integer, nullable=False)
    stock_antes = Column(Integer, nullable=False)
    stock_despues = Column(Integer, nullable=False)
    motivo = Column(String(300), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    creado_en = Column(DateTime, server_default=func.now())

    producto = relationship("Producto")
    usuario = relationship("Usuario")
