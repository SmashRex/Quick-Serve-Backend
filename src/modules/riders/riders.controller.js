import * as ridersService from './riders.service.js';

export async function createRider(req, res, next) {
  try {
    const rider = await ridersService.createRider(req.body);
    res.status(201).json(rider);
  } catch (err) {
    next(err);
  }
}

export async function getRiders(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const result = await ridersService.getRiders({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}