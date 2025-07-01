import { z } from 'zod';
import { productCreateSchema, productUpdateSchema } from '../schemas/product.js';

// Tipo para el cuerpo de la solicitud al crear un producto
export type ProductCreateRequestBody = z.infer<typeof productCreateSchema>;

// Tipo para el cuerpo de la solicitud al actualizar un producto
export type ProductUpdateRequestBody = z.infer<typeof productUpdateSchema>;