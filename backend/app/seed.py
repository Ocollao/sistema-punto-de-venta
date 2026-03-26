from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.usuario import Usuario
from app.utils.security import hash_password


def crear_usuarios_iniciales(db: Session):
    if db.query(Usuario).count() > 0:
        return

    usuarios = [
        Usuario(
            nombre="Administrador",
            email="admin@pos.cl",
            hashed_password=hash_password("admin1234"),
            rol="admin",
            activo=True,
        ),
        Usuario(
            nombre="Cajero Demo",
            email="cajero@pos.cl",
            hashed_password=hash_password("cajero1234"),
            rol="cajero",
            activo=True,
        ),
    ]

    db.add_all(usuarios)
    db.commit()
    print("✓ Usuarios iniciales creados")


def ejecutar_seed():
    db = SessionLocal()
    try:
        crear_usuarios_iniciales(db)
    finally:
        db.close()
