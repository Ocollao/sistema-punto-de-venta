from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CierreCaja(Base):
    __tablename__ = "cierres_caja"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, unique=True)
    total_ventas = Column(Integer, default=0)
    ingresos_totales = Column(Float, default=0.0)
    total_descuentos = Column(Float, default=0.0)
    efectivo_total = Column(Float, default=0.0)
    debito_total = Column(Float, default=0.0)
    credito_total = Column(Float, default=0.0)
    monto_inicial = Column(Float, default=0.0)
    efectivo_esperado = Column(Float, default=0.0)
    efectivo_declarado = Column(Float, nullable=True)
    diferencia = Column(Float, nullable=True)
    notas = Column(String(500), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    creado_en = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
