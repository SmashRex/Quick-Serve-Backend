import * as adminPayoutsService from './adminPayouts.service.js';

export async function list(req, res, next) {
  try {
    const { status, partnerId, page, limit } = req.query;
    const result = await adminPayoutsService.listPayouts({
      status,
      partnerId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function markPaid(req, res, next) {
  try {
    const payout = await adminPayoutsService.markPaid(req.params.id, req.user.id);
    res.status(200).json(payout);
  } catch (err) {
    next(err);
  }
}