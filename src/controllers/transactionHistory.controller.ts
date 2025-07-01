import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js';

// Importar servicios específicos de historial de transacciones
import {
  getAllTransactionHistoryFromDb,
  getTransactionHistoryByIdFromDb,
  createTransactionHistoryInDb,
} from '../services/transactionHistory.service.js';

// Importar esquemas Zod (para validación de req.body/params)
import { transactionHistoryCreateSchema } from '../schemas/transactionHistory.js';
import { idParamsSchema } from '../schemas/base.js';

// Importar los tipos inferidos de Drizzle desde tu archivo de esquema de Drizzle
import {
  TransactionHistory,
  TransactionHistoryInsert,
} from '../config/db.js';


/**
 * @desc Obtener todo el historial de transacciones
 * @route GET /api/transaction-history
 * @access Private (Admin/Auditor only)
 */
export const getAllTransactionHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const history: TransactionHistory[] = await getAllTransactionHistoryFromDb();
  
  res.status(200).json({
    status: 'success',
    results: history.length,
    data: {
      history,
    },
  });
});

/**
 * @desc Obtener una entrada de historial por ID
 * @route GET /api/transaction-history/:id
 * @access Private (Admin/Auditor only)
 */
export const getTransactionHistoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = idParamsSchema.parse(req.params);

  const entry: TransactionHistory | null = await getTransactionHistoryByIdFromDb(id);

  if (!entry) {
    return res.status(404).json({
      status: 'fail',
      message: 'Transaction history entry not found.',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      entry,
    },
  });
});

/**
 * @desc Crear una entrada de historial (usualmente desde otros servicios)
 * @route POST /api/transaction-history
 * @access Private (Generalmente solo interno, no expuesto directamente)
 */
export const createTransactionHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const historyDataZod = transactionHistoryCreateSchema.parse(req.body);

  const historyDataDrizzle: TransactionHistoryInsert = {
    transactionType: historyDataZod.transactionType,
    transactionId: historyDataZod.transactionId,
    entityTable: historyDataZod.entityTable,
    userId: historyDataZod.userId,
    details: historyDataZod.details,
  };

  const newEntry: TransactionHistory = await createTransactionHistoryInDb(historyDataDrizzle);
  
  res.status(201).json({
    status: 'success',
    message: 'Transaction history entry created successfully',
    data: {
      entry: newEntry,
    },
  });
});