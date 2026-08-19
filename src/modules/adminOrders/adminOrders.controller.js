import * as adminOrdersService from './adminOrders.service.js';

export async function assignRider(req, res, next) {
  try {
    const { riderId, leg } = req.body;
    const order = await adminOrdersService.assignRider(req.params.id, riderId, leg, req.user.id);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}