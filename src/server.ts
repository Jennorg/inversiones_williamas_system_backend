import app from './app.js';
import { config } from './config/index.js';

// Puerto del servidor desde configuración o por defecto
const PORT = config.port;

// Iniciar el servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(reason.name, reason.message, reason.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});