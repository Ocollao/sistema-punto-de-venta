# Sistema POS — Punto de Venta

Sistema de Punto de Venta full stack construido con Angular 17, FastAPI y SQL Server, desplegable con Docker Compose.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 17 · Tailwind CSS · Chart.js |
| Backend | Python 3.11 · FastAPI · SQLAlchemy |
| Base de datos | SQL Server 2022 |
| Autenticación | JWT (RS256) · bcrypt |
| Infraestructura | Docker · Docker Compose |
| CI/CD | GitHub Actions |

## Funcionalidades

- **Autenticación** con roles (Administrador / Cajero) y JWT
- **Dashboard** con gráficos de ventas diarias y productos más vendidos
- **Caja** — proceso de venta con búsqueda de productos y cálculo automático de totales
- **Productos** — CRUD completo con gestión de stock
- **Categorías** — organización de catálogo
- **Clientes** — registro y historial
- **Ventas** — listado con filtros por fecha y detalle de cada transacción
- **API REST** documentada con Swagger UI en `/api/docs`

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

## Cómo ejecutar

```bash
git clone https://github.com/Ocollao/sistema-punto-de-venta.git
cd sistema-punto-de-venta

# Copiar variables de entorno
cp backend/.env.example backend/.env

# Levantar todos los servicios
docker compose up --build
```

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| API Docs | http://localhost:8000/api/docs |

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@pos.cl | admin1234 |
| Cajero | cajero@pos.cl | cajero1234 |

## Estructura del proyecto

```
pos-sistema/
├── backend/                # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── models/         # Modelos ORM
│   │   ├── routers/        # Endpoints REST
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── utils/          # JWT · bcrypt
│   └── Dockerfile
├── frontend/               # Angular 17 standalone
│   ├── src/app/
│   │   ├── core/           # Servicios · Guards · Interceptores
│   │   └── features/       # Módulos por funcionalidad
│   └── Dockerfile
└── docker-compose.yml
```

## Endpoints principales

```
POST   /api/auth/login
GET    /api/productos
POST   /api/ventas
GET    /api/ventas/por-dia
GET    /api/ventas/top-productos
GET    /api/clientes
GET    /api/categorias
```

## Variables de entorno

Crear `backend/.env` con:

```env
DATABASE_URL=mssql+pyodbc://sa:TuPassword@sqlserver/pos_db?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
SECRET_KEY=tu_clave_secreta_aqui
ACCESS_TOKEN_EXPIRE_MINUTES=60
DB_PASSWORD=TuPassword
```

---

Desarrollado por **Orlando Collao** — [GitHub](https://github.com/Ocollao)
