import * as partnerOrdersService from './partnerOrders.service.js';
import  validate  from '../../middleware/validate.js';
import { z } from 'zod';

export async function getOrders(req, res, next) {
  try {
    const orders = await partnerOrdersService.getPartnerOrders(req.user.id);
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}

export async function accept(req, res, next) {
  try {
    const order = await partnerOrdersService.acceptOrder(req.user.id, req.params.id);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const order = await partnerOrdersService.updateOrderStatus(req.user.id, req.params.id, req.body.status);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getSla(req, res, next) {
  try {
    const result = await partnerOrdersService.getOrderSla(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}