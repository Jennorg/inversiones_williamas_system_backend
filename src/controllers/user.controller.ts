import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import catchAsync from '../utils/catchAshync.js'; 
import {
  getAllUsersFromDb,
  getUserByIdFromDb,
  getUserByUsernameOrEmailFromDb,
  createUserInDb,
  updateUserInDb,
  deleteUserFromDb,
} from '../services/user.service.js'; 
import { userCreateSchema, userUpdateSchema, userLoginSchema } from '../schemas/user.js'; 
import { idParamsSchema } from '../schemas/base.js'; 
import {
  User, 
  UserInsert, 
} from '../config/db.js'; 
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👤 === GET ALL USERS ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  try {
    const users: User[] = await getAllUsersFromDb();
    console.log('✅ Usuarios obtenidos exitosamente:', users.length);
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error al obtener usuarios:', error.message);
    next(error);
  }
});
export const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👤 === GET USER BY ID ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  try {
    const { id } = idParamsSchema.parse(req.params); 
    console.log('✅ ID validado:', id);
    const user: User | null = await getUserByIdFromDb(id);
    console.log('🔍 Usuario encontrado:', user ? 'Sí' : 'No');
    if (!user) {
      console.log('❌ Usuario no encontrado con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.',
      });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    console.log('✅ Usuario obtenido exitosamente:', user.username);
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en getUserById:', error.message);
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
export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👤 === CREATE USER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  try {
    const userDataZod = userCreateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', { ...userDataZod, password: '[HIDDEN]' });
    const userDataDrizzle: UserInsert = {
      username: userDataZod.username,
      email: userDataZod.email,
      passwordHash: userDataZod.password, 
      role: userDataZod.role || 'user', 
      isActive: userDataZod.isActive ?? true,
    };
    console.log('💾 Datos para DB:', { ...userDataDrizzle, passwordHash: '[HIDDEN]' });
    const newUser: User = await createUserInDb(userDataDrizzle);
    console.log('✅ Usuario creado exitosamente:', newUser.username);
    const { passwordHash, ...newUserWithoutPassword } = newUser;
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: newUserWithoutPassword,
      },
    });
    console.log('📤 Respuesta enviada - Status: 201');
  } catch (error: any) {
    console.log('❌ Error en createUser:', error.message);
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
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👤 === UPDATE USER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  try {
    const { id } = idParamsSchema.parse(req.params); 
    console.log('✅ ID validado:', id);
    const updateDataZod = userUpdateSchema.parse(req.body);
    console.log('✅ Validación Zod exitosa:', { ...updateDataZod, password: updateDataZod.password ? '[HIDDEN]' : undefined });
    const updateDataDrizzle: Partial<UserInsert> = {
      username: updateDataZod.username,
      email: updateDataZod.email,
      passwordHash: updateDataZod.password, 
      role: updateDataZod.role,
      isActive: updateDataZod.isActive,
    };
    console.log('💾 Datos para actualizar:', { ...updateDataDrizzle, passwordHash: updateDataDrizzle.passwordHash ? '[HIDDEN]' : undefined });
    const updatedUser: User | null = await updateUserInDb(id, updateDataDrizzle);
    console.log('🔍 Usuario actualizado:', updatedUser ? 'Sí' : 'No');
    if (!updatedUser) {
      console.log('❌ Usuario no encontrado para actualizar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found for update.',
      });
    }
    const { passwordHash, ...updatedUserWithoutPassword } = updatedUser;
    console.log('✅ Usuario actualizado exitosamente:', updatedUser.username);
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: updatedUserWithoutPassword,
      },
    });
    console.log('📤 Respuesta enviada - Status: 200');
  } catch (error: any) {
    console.log('❌ Error en updateUser:', error.message);
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
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('👤 === DELETE USER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('🆔 Params:', req.params);
  try {
    const { id } = idParamsSchema.parse(req.params); 
    console.log('✅ ID validado:', id);
    const deletedCount = await deleteUserFromDb(id);
    console.log('🗑️ Registros eliminados:', deletedCount);
    if (deletedCount === 0) {
      console.log('❌ Usuario no encontrado para eliminar con ID:', id);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found for deletion.',
      });
    }
    console.log('✅ Usuario eliminado exitosamente');
    res.status(204).json({
      status: 'success',
      message: 'User deleted successfully',
      data: null,
    });
    console.log('📤 Respuesta enviada - Status: 204');
  } catch (error: any) {
    console.log('❌ Error en deleteUser:', error.message);
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