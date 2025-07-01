import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js'; // Ruta sin cambios

// Importar servicios específicos de orden de venta
import {
  getAllSalesOrdersFromDb,
  getSalesOrderByIdFromDb,
  createSalesOrderInDb,
  updateSalesOrderInDb,
  deleteSalesOrderInDb,
} from '../services/salesOrder.service.js'; // Ruta sin cambios

// Importar esquemas Zod
import {
  salesOrderCreateSchema,
  salesOrderUpdateSchema,
  salesOrderItemCreateSchema, // Necesario si pasas los ítems del body al servicio
} from '../schemas/order.js'; // Ruta sin cambios (solo para Zod schemas)

import { idParamsSchema } from '../schemas/base.js'; // Esquema genérico para IDs

// Importar los tipos inferidos de Drizzle desde tu archivo de esquema de Drizzle
import {
  SalesOrder, // Tipo para registros seleccionados de DB (inferido por Drizzle)
  SalesOrderInsert, // Tipo para insertar en DB (inferido por Drizzle)
  SalesOrderItem as DrizzleSalesOrderItem, // Puedes renombrarlo para evitar conflicto si tu Zod también lo exporta
} from '../config/db.js'; // <--- ¡LA CORRECCIÓN CRUCIAL AQUÍ!

/**
 * @desc Obtener todas las órdenes de venta
 * @route GET /api/sales-orders
 * @access Private
 */
export const getAllSalesOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === GET ALL SALES ORDERS ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  
  try {
    const salesOrders: SalesOrder[] = await getAllSalesOrdersFromDb();
    console.log('✅ Órdenes de venta obtenidas exitosamente:', salesOrders.length);
    
    res.status(200).json({
      status: 'success',
      results: salesOrders.length,
      data: {
        salesOrders,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error al obtener órdenes de venta:', error.message);
    next(error);
  }
});

/**
 * @desc Obtener una orden de venta por ID
 * @route GET /api/sales-orders/:id
 * @access Private
 */
export const getSalesOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === GET SALES ORDER BY ID ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  
  try {
    // Validar y transformar el ID de los parámetros de la solicitud.
    // 'idParamsSchema.parse(req.params)' ya convierte el ID a un número.
    const { id } = idParamsSchema.parse(req.params); // <--- CORRECCIÓN AQUÍ: pasar req.params directamente
    console.log('✅ ID validado:', id);

    // Puedes incluir una opción en el servicio para cargar ítems/cliente/sede
    const salesOrder: SalesOrder | null = await getSalesOrderByIdFromDb(id /*, { includeItems: true, includeCustomer: true, includeSede: true }*/);
    console.log('🔍 Orden de venta encontrada:', salesOrder ? 'Sí' : 'No');

    if (!salesOrder) {
      console.log('❌ Orden de venta no encontrada con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Sales order not found.',
      });
    }

    console.log('✅ Orden de venta obtenida exitosamente, ID:', salesOrder.id);
    res.status(200).json({
      status: 'success',
      data: {
        salesOrder,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en getSalesOrderById:', error.message);
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
 * @desc Crear una nueva orden de venta
 * @route POST /api/sales-orders
 * @access Private
 */
export const createSalesOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === CREATE SALES ORDER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  
  try {
    const orderDataZod = salesOrderCreateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', orderDataZod);

    // Calcular el total_amount en el backend para seguridad
    let totalAmount = 0;
    orderDataZod.items.forEach(item => {
      totalAmount += item.quantity * item.unitPriceAtSale;
    });
    console.log('💰 Total calculado:', totalAmount);

    const orderDataDrizzle: SalesOrderInsert = {
      customerId: orderDataZod.customerId,
      // orderDate será CURRENT_TIMESTAMP por defecto en DB
      totalAmount: totalAmount,
      status: orderDataZod.status,
      sedeId: orderDataZod.sedeId,
    };
    console.log('💾 Datos para DB:', orderDataDrizzle);

    // Para los ítems, necesitas el tipo inferido de Zod para el array de ítems que viene del body
    type SalesOrderItemPayload = z.infer<typeof salesOrderItemCreateSchema>;
    const itemsPayload: SalesOrderItemPayload[] = orderDataZod.items;
    console.log('📦 Items para procesar:', itemsPayload.length);

    // La función de servicio debe manejar la creación de la orden principal y sus ítems en una transacción
    // Aquí pasas los items tal como vienen de Zod, no como tipos Drizzle Insert
    const newSalesOrder: SalesOrder = await createSalesOrderInDb(orderDataDrizzle, itemsPayload);
    console.log('✅ Orden de venta creada exitosamente, ID:', newSalesOrder.id);

    res.status(201).json({
      status: 'success',
      message: 'Sales order created successfully',
      data: {
        salesOrder: newSalesOrder,
      },
    });
    console.log('📤 Respuesta enviada - Status: 201');
  } catch (error: any) {
    console.log('❌ Error en createSalesOrder:', error.message);
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
 * @desc Actualizar una orden de venta existente
 * @route PUT /api/sales-orders/:id
 * @access Private
 */
export const updateSalesOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === UPDATE SALES ORDER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  
  try { // Envuelve todo en un try-catch para manejar errores de Zod
    // Validar y transformar el ID de los parámetros de la solicitud
    const { id } = idParamsSchema.parse(req.params); // <--- CORRECCIÓN AQUÍ: pasar req.params
    console.log('✅ ID validado:', id);

    const updateDataZod = salesOrderUpdateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', updateDataZod);

    const updateDataDrizzle: Partial<SalesOrderInsert> = {};
    if (updateDataZod.customerId !== undefined) updateDataDrizzle.customerId = updateDataZod.customerId;
    if (updateDataZod.status !== undefined) updateDataDrizzle.status = updateDataZod.status;
    if (updateDataZod.sedeId !== undefined) updateDataDrizzle.sedeId = updateDataZod.sedeId;
    // Si items se actualiza, es más complejo y generalmente se hace en un endpoint aparte o en el servicio
    console.log('💾 Datos para actualizar:', updateDataDrizzle);

    const updatedSalesOrder: SalesOrder | null = await updateSalesOrderInDb(id, updateDataDrizzle /*, updateDataZod.items */);
    console.log('🔍 Orden de venta actualizada:', updatedSalesOrder ? 'Sí' : 'No');

    if (!updatedSalesOrder) {
      console.log('❌ Orden de venta no encontrada para actualizar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Sales order not found for update.',
      });
    }

    console.log('✅ Orden de venta actualizada exitosamente, ID:', updatedSalesOrder.id);
    res.status(200).json({
      status: 'success',
      message: 'Sales order updated successfully',
      data: {
        salesOrder: updatedSalesOrder,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en updateSalesOrder:', error.message);
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
 * @desc Eliminar una orden de venta
 * @route DELETE /api/sales-orders/:id
 * @access Private
 */
export const deleteSalesOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === DELETE SALES ORDER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  
  try { // Envuelve todo en un try-catch para manejar errores de Zod
    // Validar y transformar el ID de los parámetros de la solicitud
    const { id } = idParamsSchema.parse(req.params); // <--- CORRECCIÓN AQUÍ: pasar req.params
    console.log('✅ ID validado:', id);

    const deletedCount = await deleteSalesOrderInDb(id);
    console.log('🗑️ Registros eliminados:', deletedCount);

    if (deletedCount === 0) {
      console.log('❌ Orden de venta no encontrada para eliminar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Sales order not found for deletion.',
      });
    }

    console.log('✅ Orden de venta eliminada exitosamente');
    res.status(204).json({
      status: 'success',
      message: 'Sales order deleted successfully',
      data: null,
    });
    console.log('📤 Respuesta enviada - Status: 204');
  } catch (error: any) {
    console.log('❌ Error en deleteSalesOrder:', error.message);
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