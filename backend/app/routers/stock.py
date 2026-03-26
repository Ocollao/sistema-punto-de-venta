from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.movimiento_stock import MovimientoStock
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.movimiento_stock import MovimientoStockResponse, AjusteStockCreate
from app.utils.security import get_current_user, require_admin

router = APIRouter()


@router.get("/movimientos", response_model=List[MovimientoStockResponse])
def listar_movimientos(
    producto_id: Optional[int] = Query(None),
    tipo: Optional[str] = Query(None),
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(MovimientoStock).options(
        joinedload(MovimientoStock.producto),
        joinedload(MovimientoStock.usuario),
    )
    if producto_id:
        query = query.filter(MovimientoStock.producto_id == producto_id)
    if tipo:
        query = query.filter(MovimientoStock.tipo == tipo)
    if fecha_inicio:
        query = query.filter(
            MovimientoStock.creado_en >= datetime.combine(fecha_inicio, datetime.min.time())
        )
    if fecha_fin:
        query = query.filter(
            MovimientoStock.creado_en <= datetime.combine(fecha_fin, datetime.max.time())
        )

    movimientos = query.order_by(MovimientoStock.creado_en.desc()).limit(500).all()
    resultado = []
    for m in movimientos:
        data = MovimientoStockResponse.model_validate(m)
        data.producto_nombre = m.producto.nombre if m.producto else None
        data.usuario_nombre = m.usuario.nombre if m.usuario else None
        resultado.append(data)
    return resultado


@router.post("/ajuste", response_model=MovimientoStockResponse, status_code=status.HTTP_201_CREATED)
def ajustar_stock(
    datos: AjusteStockCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    producto = db.query(Producto).filter(
        Producto.id == datos.producto_id, Producto.activo
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if datos.tipo not in ["ajuste_entrada", "ajuste_salida"]:
        raise HTTPException(
            status_code=400,
            detail="Tipo debe ser 'ajuste_entrada' o 'ajuste_salida'",
        )

    if datos.cantidad <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")

    stock_antes = producto.stock
    if datos.tipo == "ajuste_entrada":
        producto.stock += datos.cantidad
    else:
        if producto.stock < datos.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Disponible: {producto.stock}",
            )
        producto.stock -= datos.cantidad

    movimiento = MovimientoStock(
        producto_id=producto.id,
        tipo=datos.tipo,
        cantidad=datos.cantidad,
        stock_antes=stock_antes,
        stock_despues=producto.stock,
        motivo=datos.motivo,
        usuario_id=current_user.id,
    )
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)

    response = MovimientoStockResponse.model_validate(movimiento)
    response.producto_nombre = producto.nombre
    response.usuario_nombre = current_user.nombre
    return response
