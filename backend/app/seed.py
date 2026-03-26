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
        Categoria(nombre="Higiene Personal", descripcion="Shampoo, jabón, cepillos de dientes y desodorante"),
        Categoria(nombre="Conservas y Despensa", descripcion="Atún, legumbres, arroz, fideos y salsas"),
        Categoria(nombre="Congelados", descripcion="Helados, papas fritas congeladas y precocidos"),
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
        Producto(codigo="ELE-004", nombre="Cargador USB doble 2.4A", precio=5990, stock=18, stock_minimo=5,
                 categoria_id=cat_ids.get("Electronica"), activo=True),
        Producto(codigo="ELE-005", nombre="Pilas AAA x4 unidades", precio=1790, stock=50, stock_minimo=10,
                 categoria_id=cat_ids.get("Electronica"), activo=True),

        # Higiene Personal
        Producto(codigo="HIG-001", nombre="Shampoo anticaspa 400ml", precio=3490, stock=35, stock_minimo=8,
                 categoria_id=cat_ids.get("Higiene Personal"), activo=True),
        Producto(codigo="HIG-002", nombre="Jabón líquido antibacterial 250ml", precio=1990, stock=45, stock_minimo=10,
                 categoria_id=cat_ids.get("Higiene Personal"), activo=True),
        Producto(codigo="HIG-003", nombre="Desodorante aerosol 150ml", precio=2990, stock=28, stock_minimo=8,
                 categoria_id=cat_ids.get("Higiene Personal"), activo=True),
        Producto(codigo="HIG-004", nombre="Cepillo de dientes suave", precio=1490, stock=55, stock_minimo=10,
                 categoria_id=cat_ids.get("Higiene Personal"), activo=True),
        Producto(codigo="HIG-005", nombre="Pasta dental blanqueadora 90g", precio=2190, stock=40, stock_minimo=8,
                 categoria_id=cat_ids.get("Higiene Personal"), activo=True),
        Producto(codigo="HIG-006", nombre="Papel higiénico triple hoja x8", precio=4990, stock=2, stock_minimo=10,
                 categoria_id=cat_ids.get("Higiene Personal"), activo=True),

        # Conservas y Despensa
        Producto(codigo="CON-001", nombre="Atún en agua 170g", precio=1290, stock=90, stock_minimo=15,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),
        Producto(codigo="CON-002", nombre="Arroz grado 1 — 1kg", precio=1490, stock=75, stock_minimo=15,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),
        Producto(codigo="CON-003", nombre="Fideos spaghetti 400g", precio=990, stock=60, stock_minimo=12,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),
        Producto(codigo="CON-004", nombre="Salsa de tomate 400g", precio=1190, stock=50, stock_minimo=10,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),
        Producto(codigo="CON-005", nombre="Lentejas 500g", precio=1390, stock=40, stock_minimo=10,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),
        Producto(codigo="CON-006", nombre="Aceite vegetal 900ml", precio=2490, stock=30, stock_minimo=8,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),
        Producto(codigo="CON-007", nombre="Azúcar 1kg", precio=1290, stock=55, stock_minimo=12,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),
        Producto(codigo="CON-008", nombre="Café instantáneo 170g", precio=3990, stock=4, stock_minimo=8,
                 categoria_id=cat_ids.get("Conservas y Despensa"), activo=True),

        # Congelados
        Producto(codigo="COG-001", nombre="Helado de vainilla 1L", precio=3490, stock=20, stock_minimo=6,
                 categoria_id=cat_ids.get("Congelados"), activo=True),
        Producto(codigo="COG-002", nombre="Papas fritas congeladas 500g", precio=2490, stock=25, stock_minimo=6,
                 categoria_id=cat_ids.get("Congelados"), activo=True),
        Producto(codigo="COG-003", nombre="Nuggets de pollo 400g", precio=3990, stock=18, stock_minimo=5,
                 categoria_id=cat_ids.get("Congelados"), activo=True),
        Producto(codigo="COG-004", nombre="Pizza congelada 4 porciones", precio=4990, stock=3, stock_minimo=5,
                 categoria_id=cat_ids.get("Congelados"), activo=True),

        # Más bebidas
        Producto(codigo="BEB-006", nombre="Té negro x20 bolsitas", precio=1490, stock=45, stock_minimo=8,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),
        Producto(codigo="BEB-007", nombre="Néctar durazno 1L", precio=1190, stock=55, stock_minimo=10,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),
        Producto(codigo="BEB-008", nombre="Bebida sin azúcar 1.5L", precio=1390, stock=70, stock_minimo=15,
                 categoria_id=cat_ids.get("Bebidas"), activo=True),

        # Más snacks
        Producto(codigo="SNK-005", nombre="Chicles menta x10 unidades", precio=490, stock=80, stock_minimo=20,
                 categoria_id=cat_ids.get("Snacks y Dulces"), activo=True),
        Producto(codigo="SNK-006", nombre="Caramelos surtidos 150g", precio=890, stock=60, stock_minimo=15,
                 categoria_id=cat_ids.get("Snacks y Dulces"), activo=True),
        Producto(codigo="SNK-007", nombre="Barra de cereal x6 unidades", precio=2490, stock=35, stock_minimo=8,
                 categoria_id=cat_ids.get("Snacks y Dulces"), activo=True),
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
        Cliente(rut="13.111.222-3", nombre="Ignacio Herrera Vidal",
                email="i.herrera@gmail.com", telefono="+56 9 2109 8765", activo=True),
        Cliente(rut="17.888.999-0", nombre="Catalina Romero Fuentes",
                email="catalina.romero@icloud.com", telefono="+56 9 1098 7654", activo=True),
        Cliente(rut="10.333.444-5", nombre="Luis Navarro Espinoza",
                email="luis.navarro@empresa.cl", telefono="+56 9 0987 6543", activo=True),
        Cliente(rut="19.555.666-7", nombre="Paola Morales Ibáñez",
                email="p.morales@outlook.com", telefono="+56 9 9988 7766", activo=True),
        Cliente(rut="8.777.888-9", nombre="Distribuidora Norte Ltda",
                email="pedidos@disnorte.cl", telefono="+56 2 2987 6543", activo=True),
        Cliente(rut="20.111.222-K", nombre="Sebastián Pizarro Leiva",
                email="sebas.pizarro@gmail.com", telefono="+56 9 8877 6655", activo=True),
        Cliente(rut="6.444.555-8", nombre="Patricia Vega Contreras",
                email="patricia.vega@hotmail.com", telefono="+56 9 7766 5544", activo=True),
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
