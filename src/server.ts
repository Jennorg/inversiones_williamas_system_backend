import app from './app.js';
import { config } from './config/index.js'; // Ahora 'config' debería existir aquí.

// Importa el módulo 'drizzle-orm/sqlite-core' si lo necesitas para tipos,
// pero la instancia de 'db' la importas desde src/config/db.ts o similar
// import { db } from './config/db.js'; // Asegúrate de que esta sea la ruta correcta a tu instancia DB

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  // Aquí podrías loguear que la DB se conectó, si manejas la conexión aquí
  // console.log('Database connected!');
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(reason.name, reason.message, reason.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});