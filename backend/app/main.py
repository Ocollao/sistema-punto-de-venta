import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base, crear_base_de_datos
from app.routers import auth, categorias, productos, ventas, clientes, stock
from app.seed import ejecutar_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    import time
    for intento in range(10):
        try:
            crear_base_de_datos()
            Base.metadata.create_all(bind=engine)
            ejecutar_seed()
            break
        except Exception as e:
            print(f"Base de datos no disponible, reintentando ({intento + 1}/10)... {e}")
            time.sleep(3)
    yield

app = FastAPI(
    title="Sistema POS",
    description="API para el Sistema de Punto de Venta",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",       tags=["Autenticación"])
app.include_router(categorias.router,  prefix="/api/categorias", tags=["Categorías"])
app.include_router(productos.router,   prefix="/api/productos",  tags=["Productos"])
app.include_router(ventas.router,      prefix="/api/ventas",     tags=["Ventas"])
app.include_router(clientes.router,    prefix="/api/clientes",   tags=["Clientes"])
app.include_router(stock.router,       prefix="/api/stock",      tags=["Stock"])

os.makedirs("/app/static/productos", exist_ok=True)
app.mount("/static", StaticFiles(directory="/app/static"), name="static")


@app.get("/", tags=["General"])
def root():
    return {"mensaje": "Sistema POS API - v1.0.0"}


@app.get("/health", tags=["General"])
def health():
    return {"estado": "ok"}
