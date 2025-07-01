import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import axios from 'axios';
import catchAsync from '../utils/catchAshync.js'; // Ruta sin cambios

// Importar servicios específicos de sede
import {
  getAllSedesFromDb,
  getSedeByIdFromDb,
  createSedeInDb,
  updateSedeInDb,
  deleteSedeInDb,
} from '../services/sede.service.js'; // Ruta sin cambios

// Importar esquemas Zod (para validación de req.body)
import {
  sedeCreateSchema,
  sedeUpdateSchema,
} from '../schemas/sede.js'; // Ruta sin cambios (solo para Zod schemas)

import { idParamsSchema } from '../schemas/base.js'; // Ruta sin cambios

// Importar los tipos inferidos de Drizzle desde tu archivo de esquema de Drizzle
import {
  Sede, // Tipo para registros seleccionados de DB
  SedeInsert, // Tipo para insertar en DB
} from '../config/db.js'; // <--- ¡LA CORRECCIÓN CRUCIAL AQUÍ!

// Configuración de axios
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @desc Obtener todas las sedes
 * @route GET /api/sedes
 * @access Public (o Private)
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
 * @desc Obtener una sede por ID
 * @route GET /api/sedes/:id
 * @access Public (o Private)
 */
export const getSedeById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar y transformar el ID de los parámetros de la solicitud.
    // 'idParamsSchema.parse(req.params)' ya convierte el ID a un número.
    const { id } = idParamsSchema.parse(req.params);

    // Esta línea se ELIMINA porque 'id' ya es un número.
    // const id = parseInt(stringId, 10);

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
 * @desc Crear una nueva sede
 * @route POST /api/sedes
 * @access Private
 */
export const createSede = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log del body recibido para debugging
    console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('📥 Headers:', req.headers);
    console.log('📥 Content-Type:', req.headers['content-type']);

    // Validar que el body no esté vacío
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('❌ Body vacío detectado');
      return res.status(400).json({
        status: 'fail',
        message: 'Request body is empty or missing',
        receivedData: req.body,
        expectedFields: ['name', 'address', 'phone', 'email']
      });
    }

    // Validar con Zod y capturar errores detallados
    let sedeDataZod;
    try {
      sedeDataZod = sedeCreateSchema.parse(req.body);
      console.log('✅ Validación Zod exitosa:', sedeDataZod);
    } catch (zodError: any) {
      console.log('❌ Error de validación Zod:', JSON.stringify(zodError.errors, null, 2));
      
      // Crear respuesta detallada para el frontend
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

    const sedeDataDrizzle: SedeInsert = {
      name: sedeDataZod.name,
      address: sedeDataZod.address,
    };

    console.log('💾 Intentando crear sede en DB:', sedeDataDrizzle);

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
    
    // Log del error completo para debugging
    console.log('❌ Error completo:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    next(error);
  }
});

/**
 * @desc Actualizar una sede existente
 * @route PUT /api/sedes/:id
 * @access Private
 */
export const updateSede = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar y transformar el ID de los parámetros de la solicitud
    const { id } = idParamsSchema.parse(req.params);

    // Esta línea se ELIMINA.
    // const id = parseInt(stringId, 10);

    const updateDataZod = sedeUpdateSchema.parse(req.body);

    const updateDataDrizzle: Partial<SedeInsert> = {};
    if (updateDataZod.name !== undefined) updateDataDrizzle.name = updateDataZod.name;
    if (updateDataZod.address !== undefined) updateDataDrizzle.address = updateDataZod.address;

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
 * @desc Eliminar una sede
 * @route DELETE /api/sedes/:id
 * @access Private
 */
export const deleteSede = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar y transformar el ID de los parámetros de la solicitud
    const { id } = idParamsSchema.parse(req.params);

    // Esta línea se ELIMINA.
    // const id = parseInt(stringId, 10);

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
 * @desc Obtener información de ubicación de una sede usando una API externa
 * @route GET /api/sedes/:id/location
 * @access Public
 */
export const getSedeLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    
    const sede: Sede | null = await getSedeByIdFromDb(id);
    
    if (!sede) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sede not found.',
      });
    }

    // Usar axios para obtener información de ubicación desde una API externa
    // Ejemplo usando la API de geocoding (puedes cambiar la URL por la que necesites)
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
 * @desc Sincronizar datos de sede con un servicio externo
 * @route POST /api/sedes/:id/sync
 * @access Private
 */
export const syncSedeWithExternalService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    
    const sede: Sede | null = await getSedeByIdFromDb(id);
    
    if (!sede) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sede not found.',
      });
    }

    // Usar axios para enviar datos a un servicio externo
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
 * @desc Obtener estadísticas de sedes desde un servicio externo
 * @route GET /api/sedes/stats
 * @access Public
 */
export const getSedeStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener todas las sedes locales
    const localSedes: Sede[] = await getAllSedesFromDb();
    
    // Usar axios para obtener estadísticas desde un servicio externo
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
 * @desc Probar validación de esquema (para debugging)
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

    // Mostrar el esquema esperado
    const expectedSchema = {
      name: 'string (required, 1-100 chars)',
      address: 'string (optional, max 255 chars)'
    };

    // Validar con Zod
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