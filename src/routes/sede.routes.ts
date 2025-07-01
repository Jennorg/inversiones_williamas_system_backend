import { Router } from 'express';
import * as sedeController from '../controllers/sede.controller.js';
import { validationLogger, bodyValidationLogger } from '../middlewares/validationLogger.js';

// Router específico para las rutas de sedes
const sedeRouter = Router();

// Aplicar middleware de logging a todas las rutas
sedeRouter.use('/validate', validationLogger, bodyValidationLogger);
sedeRouter.use('/', validationLogger);

// Rutas CRUD básicas para sedes
sedeRouter.get('/', sedeController.getAllSedes);
sedeRouter.post('/', bodyValidationLogger, sedeController.createSede);
sedeRouter.get('/:id', sedeController.getSedeById);
sedeRouter.put('/:id', bodyValidationLogger, sedeController.updateSede);
sedeRouter.delete('/:id', sedeController.deleteSede);

// Rutas adicionales que usan servicios externos
sedeRouter.get('/:id/location', sedeController.getSedeLocation);
sedeRouter.post('/:id/sync', bodyValidationLogger, sedeController.syncSedeWithExternalService);
sedeRouter.get('/stats', sedeController.getSedeStats);

// Ruta para validación de datos (debe ir antes de las rutas con parámetros)
sedeRouter.post('/validate', sedeController.validateSedeData);

export default sedeRouter;