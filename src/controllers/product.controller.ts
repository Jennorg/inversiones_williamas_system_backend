import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js'; 

// Importar servicios de base de datos para productos
import {
  getAllProductsFromDb,
  getProductByIdFromDb,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
} from '../services/product.service.js'; 

// Importar tipos de Drizzle para productos
import { Product, ProductInsert } from '../config/db.js'; 

// Importar esquemas de validación
import { productCreateSchema, productUpdateSchema } from '../schemas/product.js'; 
import { idParamsSchema } from '../schemas/base.js'; 

// Importar servicios de asociación sede-producto
import { getStockBySedeForProduct, getStockBySedeForProducts, createSedeProductAssociationInDb } from '../services/sedeProductAssociation.service.js';

/**
 * Convierte una fecha a formato ISO string, manejando valores nulos
 */
function parseDateToIso(date: any) {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Mapea un producto de la base de datos al formato de la API
 * Incluye información de stock por sede
 */
async function mapProductDbToApi(productFromDb: any): Promise<any> {
  const stockBySede = await getStockBySedeForProduct(productFromDb.id);
  const stock = stockBySede.reduce((sum, s) => sum + s.stock, 0);
  return {
    id: productFromDb.id,
    name: productFromDb.name,
    sku: productFromDb.sku,
    price: productFromDb.unitPrice ?? 0,
    category: productFromDb.category,
    createdAt: parseDateToIso(productFromDb.createdAt),
    updatedAt: parseDateToIso(productFromDb.updatedAt),
    stockBySede,
    stock,
  };
}

/**
 * Mapea múltiples productos de la base de datos al formato de la API
 * Optimizado para obtener stock de múltiples productos en una sola consulta
 */
async function mapProductsDbToApi(productsFromDb: any[]): Promise<any[]> {
  const stockMap = await getStockBySedeForProducts(productsFromDb.map(p => p.id));
  return productsFromDb.map(product => {
    const stockBySede = stockMap[product.id] || [];
    const stock = stockBySede.reduce((sum, s) => sum + s.stock, 0);
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.unitPrice ?? 0,
      category: product.category,
      createdAt: parseDateToIso(product.createdAt),
      updatedAt: parseDateToIso(product.updatedAt),
      stockBySede,
      stock,
    };
  });
}

/**
 * Obtener todos los productos del sistema
 * @route GET /api/products
 * @access Public
 */
export const getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('🛍️ === GET ALL PRODUCTS ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  
  try {
    // Obtener productos de la base de datos
    const products: Product[] = await getAllProductsFromDb();
    console.log('✅ Productos obtenidos exitosamente:', products.length);
    
    // Mapear productos al formato de la API con información de stock
    const productsApi = await mapProductsDbToApi(products);
    
    res.status(200).json({
      status: 'success',
      results: productsApi.length,
      data: {
        products: productsApi,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error al obtener productos:', error.message);
    next(error);
  }
});

/**
 * Obtener un producto específico por su ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('🛍️ === GET PRODUCT BY ID ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  
  try {
    // Validar ID del producto
    const { id } = idParamsSchema.parse(req.params);
    console.log('✅ ID validado:', id);
    
    // Obtener producto de la base de datos
    const product: Product | null = await getProductByIdFromDb(id);
    console.log('🔍 Producto encontrado:', product ? 'Sí' : 'No');
    
    if (!product) {
      console.log('❌ Producto no encontrado con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found.',
      });
    }
    
    console.log('✅ Producto obtenido exitosamente:', product.name);
    
    // Mapear producto al formato de la API
    const productApi = await mapProductDbToApi(product);
    
    res.status(200).json({
      status: 'success',
      data: {
        product: productApi,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en getProductById:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});

/**
 * Crear un nuevo producto en el sistema
 * @route POST /api/products
 * @access Private
 */
export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('🛍️ === CREATE PRODUCT ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validar datos del producto
    const productDataZod = productCreateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', productDataZod);
    
    // Preparar datos para inserción en base de datos
    const productDataDrizzle: ProductInsert = {
      name: productDataZod.name,
      sku: productDataZod.sku,
      unitPrice: productDataZod.price, 
      description: productDataZod.description,
      category: productDataZod.category,
    };
    console.log('💾 Datos para DB:', productDataDrizzle);
    
    // Crear producto en la base de datos
    const newProduct: Product = await createProductInDb(productDataDrizzle);
    console.log('✅ Producto creado exitosamente:', newProduct.name);
    
    // Crear asociación sede-producto si se proporciona sedeId y stock inicial
    if (productDataZod.sedeId && typeof productDataZod.initialStockAtSede === 'number') {
      await createSedeProductAssociationInDb({
        sedeId: productDataZod.sedeId,
        productId: newProduct.id,
        stockAtSede: productDataZod.initialStockAtSede,
      });
      console.log('✅ Asociación sede-producto creada automáticamente');
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: {
        product: await mapProductDbToApi(newProduct),
      },
    });
    console.log('📤 Respuesta enviada - Status: 201');
  } catch (error: any) {
    console.log('❌ Error en createProduct:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});

/**
 * Actualizar un producto existente
 * @route PUT /api/products/:id
 * @access Private
 */
export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('🛍️ === UPDATE PRODUCT ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validar ID del producto
    const { id } = idParamsSchema.parse(req.params);
    console.log('✅ ID validado:', id);
    
    // Validar datos de actualización
    const updateDataZod = productUpdateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', updateDataZod);
    
    // Preparar datos para actualización en base de datos
    const updateDataDrizzle: Partial<ProductInsert> = {
      name: updateDataZod.name,
      sku: updateDataZod.sku,
      unitPrice: updateDataZod.price,
      description: updateDataZod.description,
      category: updateDataZod.category,
    };
    console.log('💾 Datos para actualizar:', updateDataDrizzle);
    
    // Actualizar producto en la base de datos
    const updatedProduct: Product | null = await updateProductInDb(id, updateDataDrizzle);
    console.log('🔍 Producto actualizado:', updatedProduct ? 'Sí' : 'No');
    
    if (!updatedProduct) {
      console.log('❌ Producto no encontrado para actualizar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found for update.',
      });
    }
    
    console.log('✅ Producto actualizado exitosamente:', updatedProduct.name);
    
    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: {
        product: mapProductDbToApi(updatedProduct),
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en updateProduct:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});

/**
 * Eliminar un producto del sistema
 * @route DELETE /api/products/:id
 * @access Private
 */
export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('🛍️ === DELETE PRODUCT ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  
  try {
    // Validar ID del producto
    const { id } = idParamsSchema.parse(req.params);
    console.log('✅ ID validado:', id);
    
    // Eliminar producto de la base de datos
    const deletedCount = await deleteProductFromDb(id);
    console.log('🔍 Productos eliminados:', deletedCount);
    
    if (deletedCount === 0) {
      console.log('❌ Producto no encontrado para eliminar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found for deletion.',
      });
    }
    
    console.log('✅ Producto eliminado exitosamente');
    
    res.status(204).json({
      status: 'success',
      message: 'Product deleted successfully',
      data: null,
    });
    console.log('📤 Respuesta enviada - Status: 204');
  } catch (error: any) {
    console.log('❌ Error en deleteProduct:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});