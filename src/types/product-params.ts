import { z } from 'zod';
import { idParamsSchema } from '../schemas/base.js';

// Tipo para validar los parámetros de ID en las URLs de productos
export type ProductIdParams = z.infer<typeof idParamsSchema>;