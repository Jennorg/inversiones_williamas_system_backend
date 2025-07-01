// src/types/product-params.ts
import { z } from 'zod';
import { idParamsSchema } from '../schemas/base.js'; // CAMBIO: Importa idParamsSchema desde base.js

// Este tipo se usará para validar los parámetros de la URL donde se espera un ID de producto
export type ProductIdParams = z.infer<typeof idParamsSchema>;