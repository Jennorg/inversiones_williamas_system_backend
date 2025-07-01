// Interfaz que define la estructura completa de un Producto en el sistema
export interface Product {
  id: string; // Identificador único del producto
  name: string; // Nombre del producto
  description?: string; // Descripción opcional del producto
  sku: string; // Código SKU único del producto
  price: number; // Precio del producto
  stock: number; // Cantidad disponible en inventario
  category?: string; // Categoría opcional del producto
  supplier?: string; // Proveedor opcional del producto
  lastUpdated?: Date; // Fecha de última actualización
  isActive?: boolean; // Estado activo/inactivo del producto
}