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

export async function assignPartner(req, res, next) {
  try {
    const order = await adminOrdersService.assignPartner(req.params.id, req.body.partnerId, req.user.id);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getBreaches(req, res, next) {
  try {
    const breaches = await adminOrdersService.getBreachedOrders();
    res.status(200).json(breaches);
  } catch (err) {
    next(err);
  }
}