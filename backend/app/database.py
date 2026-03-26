from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings


def crear_base_de_datos():
    """Conecta a master y crea pos_db si no existe."""
    master_url = settings.database_url.replace("/pos_db?", "/master?")
    master_engine = create_engine(master_url, isolation_level="AUTOCOMMIT", pool_pre_ping=True)
    try:
        with master_engine.connect() as conn:
            existe = conn.execute(
                text("SELECT name FROM sys.databases WHERE name = 'pos_db'")
            ).fetchone()
            if not existe:
                conn.execute(text("CREATE DATABASE pos_db"))
                print("✓ Base de datos pos_db creada")
    finally:
        master_engine.dispose()


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
