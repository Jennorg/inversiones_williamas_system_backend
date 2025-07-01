import { Router } from 'express';

// --- Importaciones de rutas ---
// Asegúrate de que todas las importaciones estén al inicio del archivo
import customerRoutes from './customer.routes.js';
import productRoutes from './product.routes.js';
import purchaseOrderRoutes from './purchaseOrder.routes.js'; 
import sedeRoutes from './sede.routes.js'
import sedeProductAssociationRoutes from './sedesProductAssociation.routes.js';

const router = Router();

// --- Montar las rutas ---
// El orden aquí no causa el ReferenceError, pero lógicamente va después de las importaciones
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/sedes', sedeRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/sede-product-associations', sedeProductAssociationRoutes);

export default router;