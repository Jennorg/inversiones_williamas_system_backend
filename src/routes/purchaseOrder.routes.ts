// src/api/routes/purchaseOrder.routes.ts
import { Router } from 'express';
import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from '../controllers/purchaseOrder.controller.js'; // Asegúrate que esta ruta y el .js sean correctos

const router = Router(); // Define el router específico para órdenes de compra

router.get('/', getAllPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', createPurchaseOrder);
router.put('/:id', updatePurchaseOrder);
router.delete('/:id', deletePurchaseOrder);

export default router; // Exporta este router