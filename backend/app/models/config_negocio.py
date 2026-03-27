from sqlalchemy import Column, Integer, String
from app.database import Base


class ConfigNegocio(Base):
    __tablename__ = "config_negocio"

    id = Column(Integer, primary_key=True, default=1)
    nombre = Column(String(200), default="Mi Negocio")
    rut = Column(String(20), nullable=True)
    direccion = Column(String(300), nullable=True)
    telefono = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    mensaje_pie = Column(String(300), default="¡Gracias por su compra!")
