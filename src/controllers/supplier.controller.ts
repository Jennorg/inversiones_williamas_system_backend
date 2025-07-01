import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js';
import {
  getAllSuppliersFromDb,
  getSupplierByIdFromDb,
  createSupplierInDb,
  updateSupplierInDb,
  deleteSupplierFromDb,
} from '../services/supplier.service.js';
import {
  supplierCreateSchema,
  supplierUpdateSchema,
} from '../schemas/supplier.js';
import { idParamsSchema } from '../schemas/base.js';
import {
  Supplier, 
  SupplierInsert, 
} from '../config/db.js';
export const getAllSuppliers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const suppliers: Supplier[] = await getAllSuppliersFromDb();
  res.status(200).json({
    status: 'success',
    results: suppliers.length,
    data: {
      suppliers,
    },
  });
});
export const getSupplierById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = idParamsSchema.parse(req.params);
  const supplier: Supplier | null = await getSupplierByIdFromDb(id);
  if (!supplier) {
    return res.status(404).json({
      status: 'fail',
      message: 'Supplier not found.',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      supplier,
    },
  });
});
export const createSupplier = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const supplierDataZod = supplierCreateSchema.parse(req.body);
  const supplierDataDrizzle: SupplierInsert = {
    name: supplierDataZod.name,
    contactPerson: supplierDataZod.contactPerson,
    phone: supplierDataZod.phone,
    email: supplierDataZod.email,
    address: supplierDataZod.address,
  };
  const newSupplier: Supplier = await createSupplierInDb(supplierDataDrizzle);
  res.status(201).json({
    status: 'success',
    message: 'Supplier created successfully',
    data: {
      supplier: newSupplier,
    },
  });
});
export const updateSupplier = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = idParamsSchema.parse(req.params);
  const updateDataZod = supplierUpdateSchema.parse(req.body);
  const updateDataDrizzle: Partial<SupplierInsert> = {};
  if (updateDataZod.name !== undefined) updateDataDrizzle.name = updateDataZod.name;
  if (updateDataZod.contactPerson !== undefined) updateDataDrizzle.contactPerson = updateDataZod.contactPerson;
  if (updateDataZod.phone !== undefined) updateDataDrizzle.phone = updateDataZod.phone;
  if (updateDataZod.email !== undefined) updateDataDrizzle.email = updateDataZod.email;
  if (updateDataZod.address !== undefined) updateDataDrizzle.address = updateDataZod.address;
  const updatedSupplier: Supplier | null = await updateSupplierInDb(id, updateDataDrizzle);
  if (!updatedSupplier) {
    return res.status(404).json({
      status: 'fail',
      message: 'Supplier not found for update.',
    });
  }
  res.status(200).json({
    status: 'success',
    message: 'Supplier updated successfully',
    data: {
      supplier: updatedSupplier,
    },
  });
});
export const deleteSupplier = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = idParamsSchema.parse(req.params);
  const deletedCount = await deleteSupplierFromDb(id);
  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Supplier not found for deletion.',
    });
  }
  res.status(204).json({
    status: 'success',
    message: 'Supplier deleted successfully',
    data: null,
  });
});