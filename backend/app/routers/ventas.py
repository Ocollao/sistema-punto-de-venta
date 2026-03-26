from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date
from app.database import get_db
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.venta import VentaCreate, VentaResponse, ResumenReporte
from app.utils.security import get_current_user

router = APIRouter()


def generar_numero_boleta(db: Session) -> str:
    total = db.query(Venta).count()
    return f"BOL-{str(total + 1).zfill(6)}"


@router.post("/", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def crear_venta(
    datos: VentaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    subtotal = 0.0
    detalles = []

    for item in datos.items:
        producto = db.query(Producto).filter(Producto.id == item.producto_id, Producto.activo == True).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto ID {item.producto_id} no encontrado")
        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock}"
            )

        item_subtotal = item.cantidad * item.precio_unitario
        subtotal += item_subtotal
        detalles.append({
            "producto": producto,
            "cantidad": item.cantidad,
            "precio_unitario": item.precio_unitario,
            "subtotal": item_subtotal,
        })

    total = subtotal - datos.descuento

    nueva_venta = Venta(
        numero_boleta=generar_numero_boleta(db),
        subtotal=subtotal,
        descuento=datos.descuento,
        total=total,
        metodo_pago=datos.metodo_pago,
        usuario_id=current_user.id,
        cliente_id=datos.cliente_id,
    )
    db.add(nueva_venta)
    db.flush()

    for d in detalles:
        detalle = DetalleVenta(
            venta_id=nueva_venta.id,
            producto_id=d["producto"].id,
            cantidad=d["cantidad"],
            precio_unitario=d["precio_unitario"],
            subtotal=d["subtotal"],
        )
        db.add(detalle)
        d["producto"].stock -= d["cantidad"]

    db.commit()
    db.refresh(nueva_venta)
    return nueva_venta


@router.get("/", response_model=List[VentaResponse])
def listar_ventas(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Venta).options(joinedload(Venta.detalles))

    if fecha_inicio:
        query = query.filter(Venta.creado_en >= datetime.combine(fecha_inicio, datetime.min.time()))
    if fecha_fin:
        query = query.filter(Venta.creado_en <= datetime.combine(fecha_fin, datetime.max.time()))

    return query.order_by(Venta.creado_en.desc()).all()


@router.get("/reporte/resumen", response_model=ResumenReporte)
def resumen_reporte(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Venta).filter(Venta.estado == "completada")

    if fecha_inicio:
        query = query.filter(Venta.creado_en >= datetime.combine(fecha_inicio, datetime.min.time()))
    if fecha_fin:
        query = query.filter(Venta.creado_en <= datetime.combine(fecha_fin, datetime.max.time()))

    ventas = query.all()
    total_ventas = len(ventas)
    ingresos = sum(v.total for v in ventas)
    ticket_promedio = ingresos / total_ventas if total_ventas > 0 else 0.0
    productos_vendidos = sum(sum(d.cantidad for d in v.detalles) for v in ventas)

    return ResumenReporte(
        total_ventas=total_ventas,
        ingresos_totales=ingresos,
        ticket_promedio=ticket_promedio,
        productos_vendidos=productos_vendidos,
    )


@router.get("/{venta_id}", response_model=VentaResponse)
def obtener_venta(venta_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    venta = db.query(Venta).options(joinedload(Venta.detalles)).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta
