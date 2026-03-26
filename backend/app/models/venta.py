from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    numero_boleta = Column(String(20), unique=True, nullable=False)
    subtotal = Column(Float, nullable=False)
    descuento = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    metodo_pago = Column(String(30), default="efectivo")  # efectivo / debito / credito
    estado = Column(String(20), default="completada")     # completada / anulada
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=True)
    creado_en = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
    cliente = relationship("Cliente", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta")
