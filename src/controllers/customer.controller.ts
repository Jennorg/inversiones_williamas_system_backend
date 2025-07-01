import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js';
import {
  getAllCustomersFromDb,
  getCustomerByIdFromDb,
  createCustomerInDb,
  updateCustomerInDb,
  deleteCustomerFromDb,
} from '../services/customer.service.js';
import { Customer, CustomerInsert } from '../config/db.js';
import { customerCreateSchema, customerUpdateSchema } from '../schemas/customer.js'; 
import { idParamsSchema } from '../schemas/base.js'; 
export const getAllCustomers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👥 === GET ALL CUSTOMERS ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  try {
    const customers: Customer[] = await getAllCustomersFromDb();
    console.log('✅ Clientes obtenidos exitosamente:', customers.length);
    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: {
        customers,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error al obtener clientes:', error.message);
    next(error);
  }
});
export const getCustomerById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👥 === GET CUSTOMER BY ID ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  try {
    const { id } = idParamsSchema.parse(req.params);
    console.log('✅ ID validado:', id);
    const customer: Customer | null = await getCustomerByIdFromDb(id);
    console.log('🔍 Cliente encontrado:', customer ? 'Sí' : 'No');
    if (!customer) {
      console.log('❌ Cliente no encontrado con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Customer not found.',
      });
    }
    console.log('✅ Cliente obtenido exitosamente:', customer.firstName, customer.lastName);
    res.status(200).json({
      status: 'success',
      data: {
        customer,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en getCustomerById:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});
export const createCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👥 === CREATE CUSTOMER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  try {
    const customerDataZod = customerCreateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', customerDataZod);
    const customerDataDrizzle: CustomerInsert = {
      firstName: customerDataZod.firstName, 
      lastName: customerDataZod.lastName,   
      email: customerDataZod.email,
      phone: customerDataZod.phone,
      address: customerDataZod.address,
    };
    console.log('💾 Datos para DB:', customerDataDrizzle);
    const newCustomer: Customer = await createCustomerInDb(customerDataDrizzle);
    console.log('✅ Cliente creado exitosamente:', newCustomer.firstName, newCustomer.lastName);
    res.status(201).json({
      status: 'success',
      message: 'Customer created successfully',
      data: {
        customer: newCustomer,
      },
    });
    console.log('📤 Respuesta enviada - Status: 201');
  } catch (error: any) {
    console.log('❌ Error en createCustomer:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});
export const updateCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👥 === UPDATE CUSTOMER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  try {
    const { id } = idParamsSchema.parse(req.params);
    console.log('✅ ID validado:', id);
    const updateDataZod = customerUpdateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', updateDataZod);
    const updateDataDrizzle: Partial<CustomerInsert> = {
      firstName: updateDataZod.firstName, 
      lastName: updateDataZod.lastName,   
      email: updateDataZod.email,
      phone: updateDataZod.phone,
      address: updateDataZod.address,
    };
    console.log('💾 Datos para actualizar:', updateDataDrizzle);
    const updatedCustomer: Customer | null = await updateCustomerInDb(id, updateDataDrizzle);
    console.log('🔍 Cliente actualizado:', updatedCustomer ? 'Sí' : 'No');
    if (!updatedCustomer) {
      console.log('❌ Cliente no encontrado para actualizar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Customer not found for update.',
      });
    }
    console.log('✅ Cliente actualizado exitosamente:', updatedCustomer.firstName, updatedCustomer.lastName);
    res.status(200).json({
      status: 'success',
      message: 'Customer updated successfully',
      data: {
        customer: updatedCustomer,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en updateCustomer:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});
export const deleteCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👥 === DELETE CUSTOMER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  try {
    const { id } = idParamsSchema.parse(req.params);
    console.log('✅ ID validado:', id);
    const deletedCount = await deleteCustomerFromDb(id);
    console.log('🗑️ Registros eliminados:', deletedCount);
    if (deletedCount === 0) {
      console.log('❌ Cliente no encontrado para eliminar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'Customer not found for deletion.',
      });
    }
    console.log('✅ Cliente eliminado exitosamente');
    res.status(204).json({
      status: 'success',
      message: 'Customer deleted successfully',
      data: null,
    });
    console.log('📤 Respuesta enviada - Status: 204');
  } catch (error: any) {
    console.log('❌ Error en deleteCustomer:', error.message);
    if (error instanceof z.ZodError) {
      console.log('❌ Error de validación Zod:', error.errors);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error in ID parameter',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
});