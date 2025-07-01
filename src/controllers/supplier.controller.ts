import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js';

// Importar servicios específicos de proveedor (ASUMIMOS QUE ESTE ARCHIVO YA EXISTE Y EXPORTA LAS FUNCIONES)
import {
  getAllSuppliersFromDb,
  getSupplierByIdFromDb,
  createSupplierInDb,
  updateSupplierInDb,
  deleteSupplierFromDb,
} from '../services/supplier.service.js';

// Importar esquemas Zod (para validación de req.body)
import {
  supplierCreateSchema,
  supplierUpdateSchema,
} from '../schemas/supplier.js';

import { idParamsSchema } from '../schemas/base.js';

// Importar los tipos inferidos de Drizzle desde tu archivo de esquema de Drizzle (RUTA CONFIRMADA)
import {
  Supplier, // Tipo para registros seleccionados de DB
  SupplierInsert, // Tipo para insertar en DB
} from '../config/db.js';


/**
 * @desc Obtener todos los proveedores
 * @route GET /api/suppliers
 * @access Public (o Private)
 */
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

/**
 * @desc Obtener un proveedor por ID
 * @route GET /api/suppliers/:id
 * @access Public (o Private)
 */
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

/**
 * @desc Crear un nuevo proveedor
 * @route POST /api/suppliers
 * @access Private
 */
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

/**
 * @desc Actualizar un proveedor existente
 * @route PUT /api/suppliers/:id
 * @access Private
 */
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

/**
 * @desc Eliminar un proveedor
 * @route DELETE /api/suppliers/:id
 * @access Private
 */
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