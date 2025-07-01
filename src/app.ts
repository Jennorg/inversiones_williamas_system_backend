import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mainRouter from './routes/index.js';

// Configuración principal de la aplicación Express
const app = express();

// Middlewares globales para todas las rutas
app.use(cors()); // Permite peticiones CORS desde el frontend
app.use(express.json()); // Parsea el body de las peticiones como JSON
app.use(morgan('dev')); // Logging de peticiones HTTP en desarrollo

// Montar todas las rutas bajo el prefijo /api
app.use('/api', mainRouter);

// Middleware para manejar rutas no encontradas (404)
app.all('/{*any}', (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`No se encontró la ruta: ${req.originalUrl} en este servidor!`) as any;
  error.statusCode = 404;
  error.status = 'fail';
  next(error);
});

export default app;
