from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.cierre_caja import CierreCaja
from app.models.venta import Venta
from app.models.usuario import Usuario
from app.schemas.cierre_caja import CierreCajaCreate, CierreCajaResponse
from app.utils.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CierreCajaResponse])
def listar_cierres(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(CierreCaja).order_by(CierreCaja.fecha.desc()).limit(60).all()


@router.post("/", response_model=CierreCajaResponse, status_code=status.HTTP_201_CREATED)
def crear_cierre(
    datos: CierreCajaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if db.query(CierreCaja).filter(CierreCaja.fecha == datos.fecha).first():
        raise HTTPException(status_code=400, detail="Ya existe un cierre registrado para esta fecha")

    inicio = datetime.combine(datos.fecha, datetime.min.time())
    fin = datetime.combine(datos.fecha, datetime.max.time())

    ventas_dia = db.query(Venta).filter(
        Venta.estado == "completada",
        Venta.creado_en >= inicio,
        Venta.creado_en <= fin,
    ).all()

    ingresos_totales = sum(v.total for v in ventas_dia)
    total_descuentos = sum(v.descuento for v in ventas_dia)

    por_metodo: dict = {}
    for v in ventas_dia:
        por_metodo[v.metodo_pago] = por_metodo.get(v.metodo_pago, 0.0) + v.total

    efectivo_total = por_metodo.get("efectivo", 0.0)
    debito_total = por_metodo.get("debito", 0.0)
    credito_total = por_metodo.get("credito", 0.0)
    efectivo_esperado = datos.monto_inicial + efectivo_total
    diferencia = (
        datos.efectivo_declarado - efectivo_esperado
        if datos.efectivo_declarado is not None
        else None
    )

    cierre = CierreCaja(
        fecha=datos.fecha,
        total_ventas=len(ventas_dia),
        ingresos_totales=ingresos_totales,
        total_descuentos=total_descuentos,
        efectivo_total=efectivo_total,
        debito_total=debito_total,
        credito_total=credito_total,
        monto_inicial=datos.monto_inicial,
        efectivo_esperado=efectivo_esperado,
        efectivo_declarado=datos.efectivo_declarado,
        diferencia=diferencia,
        notas=datos.notas,
        usuario_id=current_user.id,
    )
    db.add(cierre)
    db.commit()
    db.refresh(cierre)
    return cierre
