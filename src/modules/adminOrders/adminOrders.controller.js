import * as adminOrdersService from './adminOrders.service.js';

export async function assignRider(req, res, next) {
  try {
    const { riderId, assignmentType } = req.body;
    const order = await adminOrdersService.assignRider(req.params.id, riderId, assignmentType, req.user.id);
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

export async function getOrders(req, res, next) {
  try {
    const { status, partnerId, riderId, page, limit } = req.query;
    const result = await adminOrdersService.getOrders({
      status,
      partnerId,
      riderId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProofPhotos(req, res, next) {
  try {
    const result = await adminOrdersService.getOrderProofPhotos(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}