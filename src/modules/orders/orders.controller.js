import * as ordersService from './orders.service.js';

export async function create(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const orders = await ordersService.listOrders(req.user.id);
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.user.id, req.params.id);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const history = await ordersService.getOrderHistory(req.user.id, req.params.id);
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const order = await ordersService.cancelOrder(req.user.id, req.params.id);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}