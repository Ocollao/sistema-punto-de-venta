import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.config_negocio import ConfigNegocio
from app.schemas.config_negocio import ConfigNegocioResponse, ConfigNegocioUpdate
from app.utils.security import get_current_user, require_admin

router = APIRouter()

UPLOAD_DIR = "/app/static/config"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _get_or_create(db: Session) -> ConfigNegocio:
    config = db.query(ConfigNegocio).first()
    if not config:
        config = ConfigNegocio()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("/", response_model=ConfigNegocioResponse)
def obtener_config(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _get_or_create(db)


@router.put("/", response_model=ConfigNegocioResponse)
def actualizar_config(
    datos: ConfigNegocioUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    config = _get_or_create(db)
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(config, campo, valor)
    db.commit()
    db.refresh(config)
    return config


@router.post("/logo", response_model=ConfigNegocioResponse)
def subir_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        raise HTTPException(
            status_code=400,
            detail="Formato no permitido. Use JPG, PNG, WebP o SVG",
        )

    nombre_archivo = f"logo_{uuid.uuid4()}{ext}"
    ruta = os.path.join(UPLOAD_DIR, nombre_archivo)

    with open(ruta, "wb") as f:
        shutil.copyfileobj(file.file, f)

    config = _get_or_create(db)

    if config.logo_url:
        old_path = os.path.join(UPLOAD_DIR, os.path.basename(config.logo_url))
        if os.path.exists(old_path):
            os.remove(old_path)

    config.logo_url = f"/static/config/{nombre_archivo}"
    db.commit()
    db.refresh(config)
    return config


@router.delete("/logo", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_logo(db: Session = Depends(get_db), _=Depends(require_admin)):
    config = _get_or_create(db)
    if config.logo_url:
        old_path = os.path.join(UPLOAD_DIR, os.path.basename(config.logo_url))
        if os.path.exists(old_path):
            os.remove(old_path)
        config.logo_url = None
        db.commit()
