import { Router } from 'express';

// Importar todos los routers de la aplicación
import customerRoutes from './customer.routes.js';
import productRoutes from './product.routes.js';
import purchaseOrderRoutes from './purchaseOrder.routes.js'; 
import sedeRoutes from './sede.routes.js'
import sedeProductAssociationRoutes from './sedesProductAssociation.routes.js';

// Router principal que agrupa todas las rutas
const router = Router();

// Montar cada router en su ruta correspondiente
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/sedes', sedeRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/sede-product-associations', sedeProductAssociationRoutes);

export default router;