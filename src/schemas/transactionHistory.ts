import { z } from 'zod';
import { timestampsSchema, dateSchema } from './base.js';

export interface TransactionHistory {
  id: number;
  transactionType: string;
  transactionId?: number;
  entityTable?: string;
  userId?: number;
  details?: string; // JSON string or simple text
  transactionDate: Date;
}

export const transactionHistoryCreateSchema = z.object({
  transactionType: z.string().min(1, "El tipo de transacción es requerido."),
  transactionId: z.number().int().positive().optional(),
  entityTable: z.string().optional(),
  userId: z.number().int().positive().optional(),
  details: z.string().optional(),
});

export const transactionHistorySchema = z.object({
  id: z.number().int().positive(),
  transactionType: z.string(),
  transactionId: z.number().int().positive().optional().nullable(),
  entityTable: z.string().optional().nullable(),
  userId: z.number().int().positive().optional().nullable(),
  details: z.string().optional().nullable(),
  transactionDate: dateSchema,
});