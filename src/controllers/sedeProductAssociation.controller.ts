// src/controllers/sedeProductAssociation.controller.ts

import { Request, Response } from 'express';
import * as sedeProductAssociationService from '../services/sedeProductAssociation.service.js';

export const createSedeProductAssociation = async (req: Request, res: Response): Promise<void> => {
  const { sede_id, product_id, stock_at_sede } = req.body;

  if (!sede_id || !product_id || typeof stock_at_sede === 'undefined' || stock_at_sede < 0) {
    res.status(400).json({ status: 'error', message: 'Missing or invalid fields for association' });
    return;
  }

  const newAssociation = await sedeProductAssociationService.createSedeProductAssociationInDb({
    sedeId: sede_id,
    productId: product_id,
    stockAtSede: stock_at_sede,
  });
  
  res.status(201).json({ status: 'success', data: { association: newAssociation } });
};

export const getSedesByProductId = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;
  
  if (!productId) {
    res.status(400).json({ status: 'error', message: 'Missing productId parameter' });
    return;
  }
  
  const sedes = await sedeProductAssociationService.getSedesByProductId(Number(productId));
  
  res.status(200).json({ status: 'success', data: { sedes } });
};