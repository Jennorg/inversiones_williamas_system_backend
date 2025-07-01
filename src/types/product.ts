/**
 * Define la estructura completa de un objeto Producto en el sistema,
 * incluyendo propiedades generadas por el servidor como el 'id'.
 */
export interface Product {
  id: string; // Asume que el ID es un UUID generado por la API/BD
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  supplier?: string;
  lastUpdated?: Date; 
  isActive?: boolean;
}