import * as adminCustomersService from './adminCustomers.service.js';

export async function getCustomers(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await adminCustomersService.getCustomers({
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}