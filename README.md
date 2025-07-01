# 🏢 Inversiones Williamas System Backend

Un sistema de gestión empresarial robusto y escalable construido con Node.js, Express, TypeScript y Drizzle ORM, diseñado para manejar productos, sedes, clientes, proveedores y transacciones comerciales.

## 🚀 Características

- **API RESTful completa** con validación de datos usando Zod
- **Base de datos SQLite** con Turso (cloud) usando Drizzle ORM
- **Autenticación y autorización** con bcrypt
- **Validación robusta** de datos de entrada con mensajes de error detallados
- **Logging detallado** para debugging y monitoreo en tiempo real
- **Arquitectura modular** y escalable con separación clara de responsabilidades
- **TypeScript** para type safety completo y mejor experiencia de desarrollo
- **Gestión de stock por sede** con asociaciones sede-producto
- **Sistema de órdenes** (compra y venta) con historial de transacciones
- **Validación de esquemas** con Zod para todos los endpoints
- **Manejo de errores centralizado** con respuestas consistentes

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#-base-de-datos)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)

## 🛠️ Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd inversiones_williamas_system_backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos Turso
DATABASE_URL=your_turso_database_url
DATABASE_TOKEN=your_turso_database_token

```

## 🚀 Uso

### Desarrollo

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# El servidor estará disponible en http://localhost:4000
```

### Producción

```bash
# Construir el proyecto
npm run build

# Iniciar servidor en producción
npm start
```

### Comandos de Base de Datos

```bash
# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Sincronizar esquema con la base de datos
npm run db:push

# Abrir Drizzle Studio
npm run db:studio
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### Sedes
- `GET /api/sedes` - Obtener todas las sedes
- `GET /api/sedes/:id` - Obtener sede por ID
- `POST /api/sedes` - Crear nueva sede
- `PUT /api/sedes/:id` - Actualizar sede
- `DELETE /api/sedes/:id` - Eliminar sede
- `GET /api/sedes/:id/location` - Obtener ubicación de sede (usando API externa)
- `POST /api/sedes/:id/sync` - Sincronizar con servicio externo
- `GET /api/sedes/stats` - Obtener estadísticas desde servicio externo
- `POST /api/sedes/validate` - Validar datos de sede (para debugging)

### Productos
- `GET /api/products` - Obtener todos los productos con stock por sede
- `GET /api/products/:id` - Obtener producto por ID con stock detallado
- `POST /api/products` - Crear nuevo producto (opcional: crear asociación sede-producto)
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Clientes
- `GET /api/customers` - Obtener todos los clientes
- `GET /api/customers/:id` - Obtener cliente por ID
- `POST /api/customers` - Crear nuevo cliente
- `PUT /api/customers/:id` - Actualizar cliente
- `DELETE /api/customers/:id` - Eliminar cliente

### Proveedores
- `GET /api/suppliers` - Obtener todos los proveedores
- `GET /api/suppliers/:id` - Obtener proveedor por ID
- `POST /api/suppliers` - Crear nuevo proveedor
- `PUT /api/suppliers/:id` - Actualizar proveedor
- `DELETE /api/suppliers/:id` - Eliminar proveedor

### Órdenes de Compra
- `GET /api/purchase-orders` - Obtener todas las órdenes de compra
- `GET /api/purchase-orders/:id` - Obtener orden de compra por ID
- `POST /api/purchase-orders` - Crear nueva orden de compra
- `PUT /api/purchase-orders/:id` - Actualizar orden de compra
- `DELETE /api/purchase-orders/:id` - Eliminar orden de compra

### Órdenes de Venta
- `GET /api/sales-orders` - Obtener todas las órdenes de venta
- `GET /api/sales-orders/:id` - Obtener orden de venta por ID
- `POST /api/sales-orders` - Crear nueva orden de venta
- `PUT /api/sales-orders/:id` - Actualizar orden de venta
- `DELETE /api/sales-orders/:id` - Eliminar orden de venta

### Asociaciones Sede-Producto
- `POST /api/sede-product-associations` - Crear asociación
- `GET /api/sede-product-associations/product/:productId` - Obtener sedes por producto

### Historial de Transacciones
- `GET /api/transaction-history` - Obtener historial de transacciones
- `GET /api/transaction-history/:id` - Obtener transacción por ID
- `POST /api/transaction-history` - Crear nueva transacción
