from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from app.utils.security import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[ProductoResponse])
def listar_productos(
    busqueda: Optional[str] = Query(None),
    categoria_id: Optional[int] = Query(None),
    stock_bajo: bool = Query(False),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Producto).options(joinedload(Producto.categoria)).filter(Producto.activo == True)

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
    producto = db.query(Producto).filter(Producto.id == producto_id, Producto.activo == True).first()
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
