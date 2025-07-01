import { Router } from 'express';
import * as sedeProductAssociationController from '../controllers/sedeProductAssociation.controller.js';

const sedeProductAssociationRouter = Router();

sedeProductAssociationRouter.post(
  '/',
  sedeProductAssociationController.createSedeProductAssociation
);

sedeProductAssociationRouter.get(
  '/product/:productId',
  sedeProductAssociationController.getSedesByProductId
);

export default sedeProductAssociationRouter;
