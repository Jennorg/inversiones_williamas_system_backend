import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware para validar los datos de entrada de las solicitudes (req.body, req.params, req.query)
 * usando un esquema de Zod.
 *
 * @param schema El esquema de Zod a utilizar para la validación.
 * @returns Un middleware de Express.
 */
export const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Intenta parsear y validar la combinación de body, query y params
      // Puedes ajustar esto para validar solo req.body, req.query, o req.params según necesites.
      // Por ejemplo, para solo validar el body: schema.parse(req.body);
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // Si la validación es exitosa, pasa al siguiente middleware/controlador
    } catch (error) {
      if (error instanceof ZodError) {
        // Si es un error de Zod, enviamos una respuesta 400 Bad Request
        // con los detalles del error para depuración en el cliente.
        return res.status(400).json({
          message: 'Error de validación de datos',
          errors: error.errors, // Array de errores detallados de Zod
        });
      }
      // Para cualquier otro tipo de error inesperado, enviar 500 Internal Server Error
      return res.status(500).json({
        message: 'Error interno del servidor durante la validación',
      });
    }
  };