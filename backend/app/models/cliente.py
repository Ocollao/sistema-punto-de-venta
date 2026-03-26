from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), unique=True, index=True, nullable=True)
    nombre = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    telefono = Column(String(20), nullable=True)
    activo = Column(Boolean, default=True)
    creado_en = Column(DateTime, server_default=func.now())

    ventas = relationship("Venta", back_populates="cliente")
