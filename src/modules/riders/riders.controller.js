import * as ridersService from './riders.service.js';

export async function createRider(req, res, next) {
  try {
    const rider = await ridersService.createRider(req.body);
    res.status(201).json(rider);
  } catch (err) {
    next(err);
  }
}