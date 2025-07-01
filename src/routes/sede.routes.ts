// src/routes/sede.routes.ts

import { Router } from 'express';
import * as sedeController from '../controllers/sede.controller.js';
import { validationLogger, bodyValidationLogger } from '../middleware/validationLogger.js';

const sedeRouter = Router();

// Aplicar middleware de logging a todas las rutas POST
sedeRouter.use('/validate', validationLogger, bodyValidationLogger);
sedeRouter.use('/', validationLogger);

sedeRouter.get('/', sedeController.getAllSedes);
sedeRouter.post('/', bodyValidationLogger, sedeController.createSede);
sedeRouter.get('/:id', sedeController.getSedeById);
sedeRouter.put('/:id', bodyValidationLogger, sedeController.updateSede);
sedeRouter.delete('/:id', sedeController.deleteSede);

// Nuevas rutas que usan axios
sedeRouter.get('/:id/location', sedeController.getSedeLocation);
sedeRouter.post('/:id/sync', bodyValidationLogger, sedeController.syncSedeWithExternalService);
sedeRouter.get('/stats', sedeController.getSedeStats);

// Ruta para validación (debe ir antes de las rutas con parámetros)
sedeRouter.post('/validate', sedeController.validateSedeData);

export default sedeRouter;