import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
export const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); 
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Error de validación de datos',
          errors: error.errors, 
        });
      }
      return res.status(500).json({
        message: 'Error interno del servidor durante la validación',
      });
    }
  };