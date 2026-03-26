from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.usuario import Usuario
from app.models.categoria import Categoria
from app.models.producto import Producto
from app.models.cliente import Cliente
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


def crear_categorias_iniciales(db: Session):
    if db.query(Categoria).count() > 0:
        return

    categorias = [
        Categoria(nombre="Bebidas", descripcion="Aguas, jugos, bebidas gaseosas y energéticas"),
        Categoria(nombre="Snacks y Dulces", descripcion="Papas fritas, chocolates, galletas y confites"),
        Categoria(nombre="Lacteos", descripcion="Leche, yogurt, quesos y mantequilla"),
        Categoria(nombre="Panaderia", descripcion="Pan, marraquetas, hallullas y masas"),
        Categoria(nombre="Limpieza", descripcion="Detergentes, desengrasantes y artículos de aseo"),
        Categoria(nombre="Electronica", descripcion="Cables, pilas, cargadores y accesorios"),
    ]
    db.add_all(categorias)
    db.commit()
    print("✓ Categorías iniciales creadas")
    return {c.nombre: c.id for c in db.query(Categoria).all()}


def crear_productos_iniciales(db: Session, cat_ids: dict):
    if db.query(Producto).count() > 0:
        return

    productos = [
        # Bebidas
        Producto(codigo="BEB-001", nombre="Agua mineral 1.5L", precio=990, stock=120, stock_minimo=20,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),
        Producto(codigo="BEB-002", nombre="Bebida Cola 1.5L", precio=1490, stock=80, stock_minimo=15,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),
        Producto(codigo="BEB-003", nombre="Jugo naranja 1L", precio=1290, stock=60, stock_minimo=10,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),
        Producto(codigo="BEB-004", nombre="Bebida energética 250ml", precio=1990, stock=45, stock_minimo=10,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),
        Producto(codigo="BEB-005", nombre="Agua con gas 500ml", precio=790, stock=3, stock_minimo=10,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),

        # Snacks y Dulces
        Producto(codigo="SNK-001", nombre="Papas fritas natural 130g", precio=1290, stock=55, stock_minimo=10,
                 categoria_id=cat_ids.get("Snacks y Dulces"), activo=True),
        Producto(codigo="SNK-002", nombre="Chocolate con leche 100g", precio=1490, stock=40, stock_minimo=8,
                 categoria_id=cat_ids.get("Snacks y Dulces"), activo=True),
        Producto(codigo="SNK-003", nombre="Galletas de vainilla 200g", precio=990, stock=70, stock_minimo=15,
                 categoria_id=cat_ids.get("Snacks y Dulces"), activo=True),
        Producto(codigo="SNK-004", nombre="Maní salado 150g", precio=890, stock=4, stock_minimo=10,
                 categoria_id=cat_ids.get("Snacks y Dulces"), activo=True),

        # Lácteos
        Producto(codigo="LAC-001", nombre="Leche entera 1L", precio=1190, stock=90, stock_minimo=20,
                 categoria_id=cat_ids.get("Lacteos"), activo=True),
        Producto(codigo="LAC-002", nombre="Yogurt natural 165g", precio=590, stock=50, stock_minimo=12,
                 categoria_id=cat_ids.get("Lacteos"), activo=True),
        Producto(codigo="LAC-003", nombre="Queso gauda laminado 200g", precio=2490, stock=30, stock_minimo=8,
                 categoria_id=cat_ids.get("Lacteos"), activo=True),
        Producto(codigo="LAC-004", nombre="Mantequilla 200g", precio=1890, stock=2, stock_minimo=5,
                 categoria_id=cat_ids.get("Lacteos"), activo=True),

        # Panadería
        Producto(codigo="PAN-001", nombre="Marraqueta (unidad)", precio=150, stock=200, stock_minimo=30,
                 categoria_id=cat_ids.get("Panaderia"), activo=True),
        Producto(codigo="PAN-002", nombre="Pan de molde 24 unidades", precio=1990, stock=35, stock_minimo=10,
                 categoria_id=cat_ids.get("Panaderia"), activo=True),
        Producto(codigo="PAN-003", nombre="Hallulla (unidad)", precio=120, stock=150, stock_minimo=30,
                 categoria_id=cat_ids.get("Panaderia"), activo=True),

        # Limpieza
        Producto(codigo="LIM-001", nombre="Detergente líquido 1L", precio=2990, stock=25, stock_minimo=8,
                 categoria_id=cat_ids.get("Limpieza"), activo=True),
        Producto(codigo="LIM-002", nombre="Desengrasante multiuso 500ml", precio=1790, stock=20, stock_minimo=5,
                 categoria_id=cat_ids.get("Limpieza"), activo=True),
        Producto(codigo="LIM-003", nombre="Papel higiénico x4 unidades", precio=2190, stock=0, stock_minimo=10,
                 categoria_id=cat_ids.get("Limpieza"), activo=True),

        # Electrónica
        Producto(codigo="ELE-001", nombre="Pilas AA x4 unidades", precio=1990, stock=60, stock_minimo=10,
                 categoria_id=cat_ids.get("Electronica"), activo=True),
        Producto(codigo="ELE-002", nombre="Cable USB-C 1m", precio=4990, stock=15, stock_minimo=5,
                 categoria_id=cat_ids.get("Electronica"), activo=True),
        Producto(codigo="ELE-003", nombre="Audífonos in-ear", precio=7990, stock=3, stock_minimo=5,
                 categoria_id=cat_ids.get("Electronica"), activo=True),
    ]
    db.add_all(productos)
    db.commit()
    print("✓ Productos iniciales creados")


def crear_clientes_iniciales(db: Session):
    if db.query(Cliente).count() > 0:
        return

    clientes = [
        Cliente(rut="12.345.678-9", nombre="María González Rojas",
                email="maria.gonzalez@gmail.com", telefono="+56 9 8123 4567", activo=True),
        Cliente(rut="15.678.901-2", nombre="Carlos Muñoz Pérez",
                email="carlos.munoz@hotmail.com", telefono="+56 9 7654 3210", activo=True),
        Cliente(rut="9.876.543-1", nombre="Ana Martínez López",
                email="ana.martinez@empresa.cl", telefono="+56 9 9876 5432", activo=True),
        Cliente(rut="18.234.567-K", nombre="Jorge Díaz Soto",
                email="jorge.diaz@gmail.com", telefono="+56 9 6543 2109", activo=True),
        Cliente(rut="16.543.210-3", nombre="Valentina Torres Vargas",
                email="v.torres@outlook.com", telefono="+56 9 5432 1098", activo=True),
        Cliente(rut="11.222.333-4", nombre="Roberto Silva Campos",
                email="roberto.silva@yahoo.com", telefono="+56 9 4321 0987", activo=True),
        Cliente(rut="14.567.890-5", nombre="Fernanda Castro Núñez",
                email="f.castro@gmail.com", telefono="+56 9 3210 9876", activo=True),
        Cliente(rut="7.654.321-6", nombre="Empresa Retail SpA",
                email="compras@retail.cl", telefono="+56 2 2345 6789", activo=True),
    ]
    db.add_all(clientes)
    db.commit()
    print("✓ Clientes iniciales creados")


def ejecutar_seed():
    db = SessionLocal()
    try:
        crear_usuarios_iniciales(db)
        cat_ids = crear_categorias_iniciales(db) or {}
        crear_productos_iniciales(db, cat_ids)
        crear_clientes_iniciales(db)
    finally:
        db.close()
