import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import axios from 'axios';
import catchAsync from '../utils/catchAshync.js';

// Importar servicios de base de datos para sedes
import {
  getAllSedesFromDb,
  getSedeByIdFromDb,
  createSedeInDb,
  updateSedeInDb,
  deleteSedeInDb,
} from '../services/sede.service.js';

// Importar esquemas de validación Zod
import {
  sedeCreateSchema,
  sedeUpdateSchema,
} from '../schemas/sede.js';

import { idParamsSchema } from '../schemas/base.js';

// Importar tipos de Drizzle para sedes
import {
  Sede,
  SedeInsert,
} from '../config/db.js';

// Cliente HTTP configurado para llamadas a APIs externas
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtener todas las sedes del sistema
 * @route GET /api/sedes
 * @access Public
 */
export const getAllSedes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sedes: Sede[] = await getAllSedesFromDb();
  res.status(200).json({
    status: 'success',
    results: sedes.length,
    data: {
      sedes,
    },
  });
});

/**
 * Obtener una sede específica por su ID
 * @route GET /api/sedes/:id
 * @access Public
 */
export const getSedeById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar y convertir el ID de string a número
    const { id } = idParamsSchema.parse(req.params);

    const sede: Sede | null = await getSedeByIdFromDb(id);

    if (!sede) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sede not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        sede,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});

/**
 * Crear una nueva sede en el sistema
 * @route POST /api/sedes
 * @access Private
 */
export const createSede = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Logging detallado para debugging
    console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('📥 Headers:', req.headers);
    console.log('📥 Content-Type:', req.headers['content-type']);

    // Validar que el body de la petición no esté vacío
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('❌ Body vacío detectado');
      return res.status(400).json({
        status: 'fail',
        message: 'Request body is empty or missing',
        receivedData: req.body,
        expectedFields: ['name', 'address', 'phone', 'email']
      });
    }

    // Validar datos con Zod y manejar errores de validación
    let sedeDataZod;
    try {
      sedeDataZod = sedeCreateSchema.parse(req.body);
      console.log('✅ Validación Zod exitosa:', sedeDataZod);
    } catch (zodError: any) {
      console.log('❌ Error de validación Zod:', JSON.stringify(zodError.errors, null, 2));
      
      // Crear respuesta detallada con errores de validación
      const validationErrors = zodError.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        validationErrors,
        receivedData: req.body,
        expectedSchema: {
          name: 'string (required)',
          address: 'string (required)', 
          phone: 'string (required)',
          email: 'string (required, valid email format)'
        }
      });
    }

    // Preparar datos para inserción en base de datos
    const sedeDataDrizzle: SedeInsert = {
      name: sedeDataZod.name,
      address: sedeDataZod.address,
    };

    console.log('💾 Intentando crear sede en DB:', sedeDataDrizzle);

    // Crear sede en la base de datos
    const newSede: Sede = await createSedeInDb(sedeDataDrizzle);
    
    console.log('✅ Sede creada exitosamente:', newSede);
    
    res.status(201).json({
      status: 'success',
      message: 'Sede created successfully',
      data: {
        sede: newSede,
      },
    });
  } catch (error: any) {
    console.log('❌ Error general en createSede:', error);
    
    if (error instanceof z.ZodError) {
      console.log('❌ Error Zod no capturado:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error (unhandled)',
        errors: error.errors.map(err => ({ 
          path: err.path.join('.'), 
          message: err.message,
        }))
      });
    }
    
    // Logging completo del error para debugging
    console.log('❌ Error completo:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    next(error);
  }
});

/**
 * Actualizar una sede existente
 * @route PUT /api/sedes/:id
 * @access Private
 */
export const updateSede = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar ID de la sede
    const { id } = idParamsSchema.parse(req.params);

    // Validar datos de actualización
    const updateDataZod = sedeUpdateSchema.parse(req.body);

    // Preparar datos para actualización en base de datos
    const updateDataDrizzle: Partial<SedeInsert> = {};
    if (updateDataZod.name !== undefined) updateDataDrizzle.name = updateDataZod.name;
    if (updateDataZod.address !== undefined) updateDataDrizzle.address = updateDataZod.address;

    // Actualizar sede en la base de datos
    const updatedSede: Sede | null = await updateSedeInDb(id, updateDataDrizzle);

    if (!updatedSede) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sede not found for update.',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Sede updated successfully',
      data: {
        sede: updatedSede,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});

/**
 * Eliminar una sede del sistema
 * @route DELETE /api/sedes/:id
 * @access Private
 */
export const deleteSede = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar ID de la sede
    const { id } = idParamsSchema.parse(req.params);

    // Eliminar sede de la base de datos
    const deletedCount = await deleteSedeInDb(id);

    if (deletedCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sede not found for deletion.',
      });
    }

    res.status(204).json({
      status: 'success',
      message: 'Sede deleted successfully',
      data: null,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});

/**
 * Obtener información de ubicación de una sede usando API externa
 * @route GET /api/sedes/:id/location
 * @access Public
 */
export const getSedeLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    
    // Obtener información de la sede
    const sede: Sede | null = await getSedeByIdFromDb(id);
    
    if (!sede) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sede not found.',
      });
    }

    // Obtener información de ubicación desde API externa
    const response = await apiClient.get(`https://api.example.com/geocode`, {
      params: {
        address: sede.address,
        key: process.env.GEOCODING_API_KEY || 'demo-key'
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        sede,
        location: response.data
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    
    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        status: 'fail',
        message: 'Error fetching location data',
        error: error.message
      });
    }
    
    next(error);
  }
});

/**
 * Sincronizar datos de sede con servicio externo
 * @route POST /api/sedes/:id/sync
 * @access Private
 */
export const syncSedeWithExternalService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    
    // Obtener información de la sede
    const sede: Sede | null = await getSedeByIdFromDb(id);
    
    if (!sede) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sede not found.',
      });
    }

    // Sincronizar datos con servicio externo
    const syncResponse = await apiClient.post(`https://api.example.com/sync/sede`, {
      sedeId: sede.id,
      name: sede.name,
      address: sede.address,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY || 'demo-token'}`
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Sede synchronized successfully',
      data: {
        sede,
        syncResult: syncResponse.data
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    
    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        status: 'fail',
        message: 'Error syncing with external service',
        error: error.message
      });
    }
    
    next(error);
  }
});

/**
 * Obtener estadísticas de sedes desde servicio externo
 * @route GET /api/sedes/stats
 * @access Public
 */
export const getSedeStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener todas las sedes locales
    const localSedes: Sede[] = await getAllSedesFromDb();
    
    // Obtener estadísticas desde servicio externo
    const statsResponse = await apiClient.get(`https://api.example.com/stats/sedes`, {
      params: {
        sedeIds: localSedes.map(sede => sede.id).join(',')
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        localSedesCount: localSedes.length,
        externalStats: statsResponse.data
      },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        status: 'fail',
        message: 'Error fetching external statistics',
        error: error.message
      });
    }
    
    next(error);
  }
});

/**
 * Validar datos de sede para debugging
 * @route POST /api/sedes/validate
 * @access Public
 */
export const validateSedeData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Validando datos de sede...');
    console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('📥 Content-Type:', req.headers['content-type']);

    // Validar que el body no esté vacío
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Request body is empty',
        receivedData: req.body,
        expectedFields: ['name', 'address']
      });
    }

    // Mostrar esquema esperado
    const expectedSchema = {
      name: 'string (required, 1-100 chars)',
      address: 'string (optional, max 255 chars)'
    };

    // Validar datos con Zod
    try {
      const validatedData = sedeCreateSchema.parse(req.body);
      console.log('✅ Validación exitosa:', validatedData);
      
      return res.status(200).json({
        status: 'success',
        message: 'Data validation successful',
        validatedData,
        expectedSchema
      });
    } catch (zodError: any) {
      console.log('❌ Error de validación:', JSON.stringify(zodError.errors, null, 2));
      
      const validationErrors = zodError.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        path: err.path
      }));

      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        validationErrors,
        receivedData: req.body,
        expectedSchema,
        totalErrors: validationErrors.length
      });
    }
  } catch (error: any) {
    console.log('❌ Error en validación:', error);
    next(error);
  }
});