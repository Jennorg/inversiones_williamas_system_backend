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

## 🛠️ Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Jennorg/inversiones_williamas_system_backend
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

## 📡 API Endpoints

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
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Asociaciones Sede-Producto
- `POST /api/sede-product-associations` - Crear asociación
- `GET /api/sede-product-associations/product/:productId` - Obtener sedes por producto
