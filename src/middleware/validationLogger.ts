import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para logging detallado de validaciones
 */
export const validationLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log de la petición entrante
  console.log('\n🔍 === VALIDATION LOGGER ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  console.log('📋 Headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'user-agent': req.headers['user-agent']
  });
  console.log('🔑 Query Params:', req.query);
  console.log('🆔 Route Params:', req.params);
  console.log('================================\n');

  // Interceptar la respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    console.log('📤 Response Status:', res.statusCode);
    console.log('📤 Response Data:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    console.log('================================\n');
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware específico para validación de body
 */
export const bodyValidationLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log('\n🔍 === BODY VALIDATION ===');
  
  if (!req.body) {
    console.log('❌ No body found');
    res.status(400).json({
      status: 'fail',
      message: 'No request body found',
      expectedContentType: 'application/json'
    });
    return;
  }

  if (Object.keys(req.body).length === 0) {
    console.log('❌ Empty body object');
    res.status(400).json({
      status: 'fail',
      message: 'Request body is empty',
      receivedData: req.body
    });
    return;
  }

  console.log('✅ Body validation passed');
  console.log('📦 Body content:', JSON.stringify(req.body, null, 2));
  console.log('================================\n');

  next();
}; 