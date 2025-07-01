import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// --- Importa tu archivo central de rutas (mainRouter) ---
import mainRouter from './routes/index.js';

const app = express();

// 1. Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 2. Montar rutas bajo el prefijo /api
app.use('/api', mainRouter);

// 3. Ruta para manejar 404
app.all('/{*any}', (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`No se encontró la ruta: ${req.originalUrl} en este servidor!`) as any;
  error.statusCode = 404;
  error.status = 'fail';
  next(error);
});

export default app;
