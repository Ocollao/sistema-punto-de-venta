from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import os, uuid, shutil
from app.database import get_db
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from app.utils.security import get_current_user, require_admin

UPLOAD_DIR = "/app/static/productos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()


@router.get("/", response_model=List[ProductoResponse])
def listar_productos(
    busqueda: Optional[str] = Query(None),
    categoria_id: Optional[int] = Query(None),
    stock_bajo: bool = Query(False),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Producto).options(joinedload(Producto.categoria)).filter(Producto.activo)

    if busqueda:
        query = query.filter(
            Producto.nombre.ilike(f"%{busqueda}%") | Producto.codigo.ilike(f"%{busqueda}%")
        )
    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)
    if stock_bajo:
        query = query.filter(Producto.stock <= Producto.stock_minimo)

    productos = query.all()
    resultado = []
    for p in productos:
        data = ProductoResponse.model_validate(p)
        data.categoria_nombre = p.categoria.nombre if p.categoria else None
        resultado.append(data)
    return resultado


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    producto = db.query(Producto).filter(Producto.id == producto_id, Producto.activo).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existente = db.query(Producto).filter(Producto.codigo == producto.codigo).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un producto con ese código")

    nuevo = Producto(**producto.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    producto.activo = False
    db.commit()


@router.post("/{producto_id}/imagen", response_model=ProductoResponse)
def subir_imagen(
    producto_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=400,
            detail="Formato no permitido. Use JPG, PNG o WebP",
        )

    nombre_archivo = f"{uuid.uuid4()}{ext}"
    ruta = os.path.join(UPLOAD_DIR, nombre_archivo)

    with open(ruta, "wb") as f:
        shutil.copyfileobj(file.file, f)

    if producto.imagen_url:
        old_path = os.path.join(UPLOAD_DIR, os.path.basename(producto.imagen_url))
        if os.path.exists(old_path):
            os.remove(old_path)

    producto.imagen_url = f"/static/productos/{nombre_archivo}"
    db.commit()
    db.refresh(producto)
    return producto
