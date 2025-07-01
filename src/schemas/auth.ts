import { z } from 'zod';
import { dateSchema } from './base.js';

export interface AuthToken {
  id: number;
  userId: number;
  token: string;
  tokenType: 'session' | 'password_reset' | 'email_verification';
  expiresAt: Date;
  createdAt: Date;
}

export const authTokenSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  token: z.string().min(1),
  tokenType: z.enum(['session', 'password_reset', 'email_verification']),
  expiresAt: dateSchema,
  createdAt: dateSchema,
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido."),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "El token de restablecimiento es requerido."),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
});