from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, categorias, productos, ventas, clientes

app = FastAPI(
    title="Sistema POS",
    description="API para el Sistema de Punto de Venta",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router,        prefix="/api/auth",       tags=["Autenticación"])
app.include_router(categorias.router,  prefix="/api/categorias", tags=["Categorías"])
app.include_router(productos.router,   prefix="/api/productos",  tags=["Productos"])
app.include_router(ventas.router,      prefix="/api/ventas",     tags=["Ventas"])
app.include_router(clientes.router,    prefix="/api/clientes",   tags=["Clientes"])


@app.get("/", tags=["General"])
def root():
    return {"mensaje": "Sistema POS API - v1.0.0"}


@app.get("/health", tags=["General"])
def health():
    return {"estado": "ok"}
