import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js';
import {
  getAllPurchaseOrdersFromDb,
  getPurchaseOrderByIdFromDb,
  createPurchaseOrderInDb,
  updatePurchaseOrderInDb,
  deletePurchaseOrderFromDb,
} from '../services/purchaseOrder.service.js';
import { PurchaseOrder, PurchaseOrderInsert } from '../config/db.js';
import { purchaseOrderCreateSchema, purchaseOrderUpdateSchema } from '../schemas/purchaseOrder.js';
import { idParamsSchema } from '../schemas/base.js';
export const getAllPurchaseOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const allPurchaseOrders: PurchaseOrder[] = await getAllPurchaseOrdersFromDb();
  res.status(200).json({
    status: 'success',
    results: allPurchaseOrders.length,
    data: {
      purchaseOrders: allPurchaseOrders,
    },
  });
});
export const getPurchaseOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = idParamsSchema.parse(req.params);
  const purchaseOrder: PurchaseOrder | null = await getPurchaseOrderByIdFromDb(id);
  if (!purchaseOrder) {
    return res.status(404).json({
      status: 'fail',
      message: 'Purchase Order not found.',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      purchaseOrder,
    },
  });
});
export const createPurchaseOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchaseOrderDataZod = purchaseOrderCreateSchema.parse(req.body);
  const purchaseOrderDataDrizzle: PurchaseOrderInsert = {
    supplierId: purchaseOrderDataZod.supplierId,
    orderDate: purchaseOrderDataZod.orderDate || new Date().toISOString(),
    totalAmount: purchaseOrderDataZod.totalAmount,
    status: purchaseOrderDataZod.status,
  };
  const newPurchaseOrder: PurchaseOrder = await createPurchaseOrderInDb(purchaseOrderDataDrizzle);
  res.status(201).json({
    status: 'success',
    message: 'Purchase Order created successfully',
    data: {
      purchaseOrder: newPurchaseOrder,
    },
  });
});
export const updatePurchaseOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = idParamsSchema.parse(req.params);
  const updateDataZod = purchaseOrderUpdateSchema.parse(req.body);
  const updateDataDrizzle: Partial<PurchaseOrderInsert> = {
    supplierId: updateDataZod.supplierId,
    orderDate: updateDataZod.orderDate,
    totalAmount: updateDataZod.totalAmount,
    status: updateDataZod.status,
  };
  const updatedPurchaseOrder: PurchaseOrder | null = await updatePurchaseOrderInDb(id, updateDataDrizzle);
  if (!updatedPurchaseOrder) {
    return res.status(404).json({
      status: 'fail',
      message: 'Purchase Order not found for update.',
    });
  }
  res.status(200).json({
    status: 'success',
    message: 'Purchase Order updated successfully',
    data: {
      purchaseOrder: updatedPurchaseOrder,
    },
  });
});
export const deletePurchaseOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = idParamsSchema.parse(req.params);
  const deletedCount = await deletePurchaseOrderFromDb(id);
  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Purchase Order not found for deletion.',
    });
  }
  res.status(204).json({
    status: 'success',
    message: 'Purchase Order deleted successfully',
    data: null,
  });
});