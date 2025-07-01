import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js'; 
import {
  getAllSalesOrdersFromDb,
  getSalesOrderByIdFromDb,
  createSalesOrderInDb,
  updateSalesOrderInDb,
  deleteSalesOrderInDb,
} from '../services/salesOrder.service.js'; 
import {
  salesOrderCreateSchema,
  salesOrderUpdateSchema,
  salesOrderItemCreateSchema, 
} from '../schemas/order.js'; 
import { idParamsSchema } from '../schemas/base.js'; 
import {
  SalesOrder, 
  SalesOrderInsert, 
  SalesOrderItem as DrizzleSalesOrderItem, 
} from '../config/db.js'; 
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
export const getSalesOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === GET SALES ORDER BY ID ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  try {
    const { id } = idParamsSchema.parse(req.params); 
    console.log('✅ ID validado:', id);
    const salesOrder: SalesOrder | null = await getSalesOrderByIdFromDb(id );
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
export const createSalesOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === CREATE SALES ORDER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  try {
    const orderDataZod = salesOrderCreateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', orderDataZod);
    let totalAmount = 0;
    orderDataZod.items.forEach(item => {
      totalAmount += item.quantity * item.unitPriceAtSale;
    });
    console.log('💰 Total calculado:', totalAmount);
    const orderDataDrizzle: SalesOrderInsert = {
      customerId: orderDataZod.customerId,
      totalAmount: totalAmount,
      status: orderDataZod.status,
      sedeId: orderDataZod.sedeId,
    };
    console.log('💾 Datos para DB:', orderDataDrizzle);
    type SalesOrderItemPayload = z.infer<typeof salesOrderItemCreateSchema>;
    const itemsPayload: SalesOrderItemPayload[] = orderDataZod.items;
    console.log('📦 Items para procesar:', itemsPayload.length);
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
export const updateSalesOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === UPDATE SALES ORDER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  try { 
    const { id } = idParamsSchema.parse(req.params); 
    console.log('✅ ID validado:', id);
    const updateDataZod = salesOrderUpdateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', updateDataZod);
    const updateDataDrizzle: Partial<SalesOrderInsert> = {};
    if (updateDataZod.customerId !== undefined) updateDataDrizzle.customerId = updateDataZod.customerId;
    if (updateDataZod.status !== undefined) updateDataDrizzle.status = updateDataZod.status;
    if (updateDataZod.sedeId !== undefined) updateDataDrizzle.sedeId = updateDataZod.sedeId;
    console.log('💾 Datos para actualizar:', updateDataDrizzle);
    const updatedSalesOrder: SalesOrder | null = await updateSalesOrderInDb(id, updateDataDrizzle );
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
export const deleteSalesOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('💰 === DELETE SALES ORDER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  try { 
    const { id } = idParamsSchema.parse(req.params); 
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